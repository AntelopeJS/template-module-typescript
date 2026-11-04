import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  equal,
  exists,
  exitIs,
  fileHas,
  has,
  interrupted,
  type JourneyContext,
  type VerifyConfig,
} from "@antelopejs/tooling-configs/verify";

const TEMPLATE = "Module Typescript";
const HOOKS = "construct,destroy,start,stop";
const INTERFACE = "dist/interfaces/template-module/beta";

/** Prints, with the module's own Node, the manifest fields a journey compares. */
const MANIFEST_FIELDS = "const m = require('./package.json'); console.log(JSON.stringify({ name: m.name, main: m.main, baseUrl: m.antelopeJs.baseUrl, implements: m.antelopeJs.implements, test: m.antelopeJs.test }))";

/**
 * Creates a module from the template with `ajs module init`, as a user does, and installs it; returns its folder.
 * The harness scaffolds only projects, so the first step uses it for what it also does: pointing `ajs` at the offline manifest.
 */
async function scaffolded(context: JourneyContext, install = true): Promise<string> {
  const module = join(context.work, "my-module");
  const offline = await context.scaffold("point ajs at the offline manifest", module, ["--help"]);
  context.expect(offline.folder, [exitIs(offline, 0)], { critical: true });
  const init = await context.command("ajs module init", "pnpm", ["exec", "ajs", "module", "init", module, "--template", TEMPLATE, "--pm", "pnpm", "--git-init"], {
    cwd: context.repo,
  });
  context.expect(init.folder, [exitIs(init, 0), exists(join(module, "package.json")), exists(join(module, "src/index.ts"))], { critical: true });
  context.tree("scaffolded tree", module);
  if (install) {
    const done = await context.command("pnpm install", "pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], { cwd: module });
    context.expect(done.folder, [exitIs(done, 0)], { critical: true });
  }
  return module;
}

async function built(context: JourneyContext): Promise<string> {
  const module = await scaffolded(context);
  const build = await context.command("pnpm run build", "pnpm", ["run", "build"], { cwd: module });
  context.expect(build.folder, [exitIs(build, 0), exists(join(module, "dist/index.js")), exists(join(module, "dist/index.d.ts"))], { critical: true });
  return module;
}

const config: VerifyConfig = {
  doors: {
    data: null,
    format: null,
    contract: null,
    outbound: null,
    exposure: {
      globs: [".gitignore", ".npmrc"],
      funnels: [],
      containments: [],
      why: "every module created from the template inherits what git and npm leave out; a dropped .env line commits secrets in modules a revert never reaches",
    },
    publish: null,
  },
  template: {
    name: TEMPLATE,
    probe: { log: /Hello world/ },
  },
  journeys: {
    "scaffold-shape": {
      title: "the created module has the manifest, the interface and its implementation, the test setup and the playground the README promises",
      entryPoint: `\`ajs module init my-module --template "${TEMPLATE}" --pm pnpm\``,
      async run(context) {
        const module = await scaffolded(context, false);
        const manifest = await context.command("read the manifest", "node", ["-e", MANIFEST_FIELDS], { cwd: module });
        const scripts = await context.command("list the scripts", "node", ["-p", "Object.keys(require('./package.json').scripts).join()"], { cwd: module });
        context.expect(manifest.folder, [
          exitIs(manifest, 0),
          equal(
            "the manifest names the module, its compiled entry, dist as the runtime base, the self implementation and the test config",
            manifest.stdout.trim(),
            JSON.stringify({ name: "antelopejs-module", main: "dist/index.js", baseUrl: "dist", implements: ["antelopejs-module"], test: "antelope.test.ts" }),
          ),
          equal("every documented script exists", ["dev", "build", "test", "checks", "typecheck", "lint"].filter((name) => !scripts.stdout.trim().split(",").includes(name)), []),
        ]);
        context.expect(context.tree("created files", module).folder, [
          exists(join(module, "src/interfaces/template-module/beta/index.ts")),
          exists(join(module, "src/implementations/template-module/beta/index.ts")),
          exists(join(module, "test/log.test.ts")),
          exists(join(module, "antelope.test.ts")),
          exists(join(module, "playground/src/index.ts")),
          exists(join(module, "playground/antelope.config.ts")),
          exists(join(module, ".nvmrc")),
          fileHas(join(module, "src/index.ts"), /ImplementInterface/),
          fileHas(join(module, "src/index.ts"), /export async function construct/),
          fileHas(join(module, "src/index.ts"), /export function start/),
          fileHas(join(module, "src/index.ts"), /export function stop/),
          fileHas(join(module, "src/index.ts"), /export function destroy/),
          fileHas(join(module, "playground/antelope.config.ts"), /"antelopejs-module"/),
        ]);
      },
    },
    "module-build": {
      title: "the built module exports exactly the four lifecycle hooks, and its interface subpath exports Log",
      entryPoint: "`pnpm run build`, then loading `dist/index.js` and the interface subpath other modules import",
      async run(context) {
        const module = await built(context);
        const keys = await context.command("exports of dist/index.js", "node", ["-p", "Object.keys(require('./dist/index.js')).sort().join()"], { cwd: module });
        context.expect(keys.folder, [exitIs(keys, 0), equal("the four hooks", keys.stdout.trim(), HOOKS)]);
        const contract = await context.command("exports of the interface subpath", "node", ["-p", `Object.keys(require('antelopejs-module/${INTERFACE}')).join()`], { cwd: join(module, "playground") });
        context.expect(contract.folder, [exitIs(contract, 0), equal("the contract is Log", contract.stdout.trim(), "Log")]);
      },
    },
    "playground-dev": {
      title: "the playground builds and prints Hello world through the Log interface the module implements, and Ctrl+C exits 130",
      entryPoint: "`pnpm build`, `pnpm --dir playground build` and `pnpm dev` in the created module",
      async run(context) {
        const module = await built(context);
        const playground = await context.command("pnpm --dir playground build", "pnpm", ["--dir", "playground", "run", "build"], { cwd: module });
        context.expect(playground.folder, [exitIs(playground, 0), exists(join(module, "playground/dist/index.js"))], { critical: true });
        const app = await context.dev("pnpm dev", join(module, "playground"), { args: ["--watch"] });
        const stopped = await context.stop("SIGINT", app);
        context.expect(stopped.folder, [interrupted(stopped), has("the Log line", stopped.stdout, /\[INFO\] Hello world/)]);
      },
    },
    "module-test": {
      title: "the module's own test runs through `pnpm test` and passes, with the Log test named in the output",
      entryPoint: "`pnpm test` in the created module",
      async run(context) {
        const module = await scaffolded(context);
        const test = await context.command("pnpm test", "pnpm", ["test"], { cwd: module });
        context.expect(test.folder, [exitIs(test, 0), has("stdout", test.stdout, /logs a message through the module implementation/), has("stdout", test.stdout, /1 passing/)]);
      },
    },
    "module-test-fails": {
      title: "a failing test added to the module makes `pnpm test` fail and be reported",
      entryPoint: "`pnpm test` after adding `test/broken.test.ts`",
      async run(context) {
        const module = await scaffolded(context);
        context.edit("add a failing test", join(module, "test/broken.test.ts"), "describe('broken', () => { it('fails', () => { throw new Error('verify-broken'); }); });\n");
        const test = await context.command("pnpm test", "pnpm", ["test"], { cwd: module });
        context.expect(test.folder, [equal("the run failed", test.exitCode !== 0, true), has("output", test.stdout + test.stderr, /verify-broken/), has("output", test.stdout, /1 failing/)]);
      },
    },
    "scaffold-lint": {
      title: "the created module passes its typecheck, lint and knip",
      entryPoint: "`pnpm run typecheck`, `pnpm run lint` and `pnpm run knip`",
      async run(context) {
        const module = await scaffolded(context);
        for (const script of ["typecheck", "lint", "knip"]) {
          const done = await context.command(`pnpm run ${script}`, "pnpm", ["run", script], { cwd: module });
          context.expect(done.folder, [exitIs(done, 0)]);
        }
      },
    },
    "scaffold-lint-rejects": {
      title: "typecheck rejects an unused local, and lint rejects a debugger statement, so the configs are live",
      entryPoint: "`pnpm run typecheck` and `pnpm run lint` after editing `src/`",
      async run(context) {
        const module = await scaffolded(context);
        context.edit("add an unused local", join(module, "src/unused.ts"), "export function unused(): void {\n  const value = 1;\n}\n");
        const typecheck = await context.command("pnpm run typecheck", "pnpm", ["run", "typecheck"], { cwd: module });
        context.expect(typecheck.folder, [equal("typecheck failed", typecheck.exitCode !== 0, true), has("typecheck output", typecheck.stdout + typecheck.stderr, /value/)]);
        context.edit("replace it with a debugger statement", join(module, "src/unused.ts"), "debugger;\nexport {};\n");
        const lint = await context.command("pnpm run lint", "pnpm", ["run", "lint"], { cwd: module });
        context.expect(lint.folder, [equal("lint failed", lint.exitCode !== 0, true), has("lint output", lint.stdout + lint.stderr, /debugger/)]);
      },
    },
    "scaffold-checks": {
      title: "the created module passes `pnpm run checks` after its first commit, as AGENTS.md tells the user to do before changing anything",
      entryPoint: "the first `git commit`, whose hook formats the `package.json` the CLI rewrote, then `pnpm run checks`",
      async run(context) {
        const module = await scaffolded(context);
        const add = await context.command("git add", "git", ["add", "-A"], { cwd: module });
        context.expect(add.folder, [exitIs(add, 0)], { critical: true });
        const commit = await context.command("first commit", "git", ["-c", "user.name=verify", "-c", "user.email=verify@example.com", "commit", "-m", "chore: initial commit"], { cwd: module });
        context.expect(commit.folder, [exitIs(commit, 0)], { critical: true });
        const checks = await context.command("pnpm run checks", "pnpm", ["run", "checks"], { cwd: module });
        context.expect(checks.folder, [exitIs(checks, 0)]);
      },
    },
    "scaffold-docs": {
      title: "every command the README names exists in the created module, and the files it points at are there",
      entryPoint: "reading `README.md` and `CONTRIBUTING.md` of the created module",
      async run(context) {
        const module = await scaffolded(context, false);
        const listed = await context.command("list the scripts", "node", ["-p", "Object.keys(require('./package.json').scripts).join()"], { cwd: module });
        const scripts = listed.stdout.trim().split(",");
        const readme = readFileSync(join(module, "README.md"), "utf8");
        const named = [...new Set([...readme.matchAll(/`pnpm (?:run )?([a-z:]+)`/g)].map((match) => match[1] ?? ""))].filter((name) => name !== "install" && name !== "add");
        context.expect(context.tree("created files", module).folder, [
          exitIs(listed, 0),
          equal("README commands without a script", named.filter((name) => !scripts.includes(name)), []),
          equal("README names at least dev, build and test", ["dev", "build", "test"].filter((name) => !named.includes(name)), []),
          has("README", readme, /ajs module init/),
          fileHas(join(module, "CONTRIBUTING.md"), /./),
          fileHas(join(module, "LICENSE"), /License/i),
          exists(join(module, "AGENTS.md")),
        ]);
      },
    },
    "scaffold-gitignore": {
      title: "the created module's git ignores secrets, dependencies and build output, and keeps its sources tracked",
      entryPoint: "`git check-ignore` and `git status` in the created module",
      async run(context) {
        const module = await built(context);
        context.edit("create a .env", join(module, ".env"), "SECRET=verify\n");
        for (const path of [".env", ".env.local", "node_modules/x", "dist/index.js", "coverage/x", ".antelope/cache/x", "playground/dist/index.js", "playground/node_modules/x"]) {
          const ignored = await context.command(`git check-ignore ${path}`, "git", ["check-ignore", "-q", path], { cwd: module });
          context.expect(ignored.folder, [equal(`${path} is ignored`, ignored.exitCode, 0)]);
        }
        for (const path of ["src/index.ts", "package.json", "README.md", "antelope.test.ts", "playground/src/index.ts", "playground/package.json"]) {
          const kept = await context.command(`git check-ignore ${path}`, "git", ["check-ignore", "-q", path], { cwd: module });
          context.expect(kept.folder, [equal(`${path} is not ignored`, kept.exitCode, 1)]);
        }
        const status = await context.command("untracked files after install, build and .env", "git", ["ls-files", "--others", "--exclude-standard"], { cwd: module });
        const leaked = status.stdout.split("\n").filter((path) => /^(node_modules|dist|coverage|\.antelope|playground\/(node_modules|dist))\/|^\.env/.test(path));
        context.expect(status.folder, [equal("no secret, dependency or build output is left untracked", leaked, [])]);
      },
    },
  },
};

export default config;
