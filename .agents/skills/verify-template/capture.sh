#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ] || { [ -e "$1" ] && [ -n "$(ls -A "$1")" ]; }; then
  echo "Usage: capture.sh <run-dir>, a missing or empty directory" >&2
  exit 2
fi

repo=$(git rev-parse --show-toplevel)
ajs="$repo/node_modules/.bin/ajs"
mkdir -p "$1/logs" "$1/work/home"
run=$(cd "$1" && pwd -P)
logs="$run/logs"
work="$run/work"
app="$work/app"
dev_pid=""

export HOME="$work/home" CI=1 AJS_NO_UPDATE_CHECK=1 NO_COLOR=1

stop_dev() {
  if [ -n "$dev_pid" ] && kill -0 "$dev_pid" 2>/dev/null; then
    kill -INT -- "-$dev_pid" 2>/dev/null || true
    for _ in $(seq 1 20); do kill -0 "$dev_pid" 2>/dev/null || return 0; sleep 0.5; done
    kill -KILL -- "-$dev_pid" 2>/dev/null || true
  fi
}

finish() {
  stop_dev
  rm -rf "$work"
}
trap finish EXIT

step=0
run_step() {
  local name="$1"
  shift
  step=$((step + 1))
  local log
  log="$logs/$(printf '%02d' "$step")-$name.log"
  printf '$ %s\n' "$*" > "$log"
  if ! (cd "${cwd:-$app}" && "$@") >> "$log" 2>&1; then
    echo "FAIL $name: $*" >&2
    tail -n 20 "$log" >&2
    echo "log: $log" >&2
    exit 1
  fi
}

commit() {
  git add -A
  git -c user.name=verify-template -c user.email=verify-template@localhost commit -q -m "chore: scaffold the module"
}

no_agent_folders() {
  for excluded in .agents .claude/skills; do
    if [ -e "$app/$excluded" ]; then
      echo "$excluded was copied into the module"
      return 1
    fi
  done
  (cd "$app" && find . -path ./node_modules -prune -o -path ./.git -prune -o -type f -print | sort)
}

dev_until_ready() {
  setsid pnpm dev > "$logs/dev.log" 2>&1 &
  dev_pid=$!
  for _ in $(seq 1 240); do
    if grep -q 'Hello world' "$logs/dev.log"; then
      grep 'Hello world' "$logs/dev.log"
      stop_dev
      return 0
    fi
    kill -0 "$dev_pid" 2>/dev/null || break
    sleep 0.5
  done
  echo "pnpm dev never logged Hello world"
  cat "$logs/dev.log"
  return 1
}

snapshot() {
  git init -q -b main "$work/template"
  git -C "$repo" ls-files -z --cached --others --exclude-standard \
    | (cd "$repo" && tar --null -T - -cf -) | tar -C "$work/template" -xf -
  (cd "$work/template" && commit)
  git init -q -b main "$work/catalog"
  printf '{"starredInterfaces":[],"templates":[{"name":"Local template","repository":"%s","branch":"main"}]}\n' \
    "$work/template" > "$work/catalog/manifest.json"
  (cd "$work/catalog" && commit)
}

cwd="$work" run_step snapshot snapshot
cwd="$work" run_step init "$ajs" module init app --git "$work/catalog" --template local-template --interfaces "" --pm pnpm --git-init
run_step scaffold-files no_agent_folders
run_step install pnpm install --frozen-lockfile
run_step build pnpm build
run_step first-commit commit
run_step checks pnpm run checks
run_step playground-build pnpm --dir playground build
run_step dev dev_until_ready
