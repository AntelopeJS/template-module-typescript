#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ] || { [ -e "$1" ] && [ -n "$(ls -A "$1")" ]; }; then
  echo "Usage: capture.sh <run-dir>, a missing or empty directory" >&2
  exit 2
fi

repo=$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)
ajs="$repo/node_modules/.bin/ajs"
mkdir -p "$1/logs" "$1/work/home"
run=$(cd "$1" && pwd -P)
logs="$run/logs"
work="$run/work"
app="$work/app"
dev_pid_file="$work/dev.pid"

npm_config_store_dir=$(cd "$repo" && pnpm store path)
export npm_config_store_dir HOME="$work/home" CI=1 AJS_NO_UPDATE_CHECK=1 NO_COLOR=1
unset LEFTHOOK

group_alive() {
  kill -0 -- "-$1" 2>/dev/null
}

stop_dev() {
  [ -f "$dev_pid_file" ] || return 0
  local pgid
  pgid=$(cat "$dev_pid_file")
  rm -f "$dev_pid_file"
  kill -INT -- "-$pgid" 2>/dev/null || return 0
  for _ in $(seq 1 40); do
    group_alive "$pgid" || return 0
    sleep 0.5
  done
  kill -KILL -- "-$pgid" 2>/dev/null || true
}

finish() {
  stop_dev
  rm -rf "$work"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

step=0
run_step() {
  local name="$1"
  shift
  step=$((step + 1))
  local log status
  log="$logs/$(printf '%02d' "$step")-$name.log"
  printf '$ %s\n' "$*" > "$log"
  set +e
  (
    set -e
    cd "${cwd:-$app}"
    "$@"
  ) >> "$log" 2>&1
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    echo "FAIL $name: $*" >&2
    tail -n 20 "$log" >&2
    echo "log: $log" >&2
    exit 1
  fi
}

commit() {
  git add -A
  local out
  out=$(git -c user.name=verify-template-module-typescript -c user.email=verify-template-module-typescript@localhost commit -q -m "chore: scaffold the module" 2>&1) || {
    printf '%s\n' "$out"
    return 1
  }
  printf '%s\n' "$out"
  if ! grep -q 'antelopejs-lint' <<< "$out"; then
    echo "the pre-commit hook did not run"
    return 1
  fi
}

install_deps() {
  pnpm install --frozen-lockfile
  if [ ! -x .git/hooks/pre-commit ]; then
    echo "prepare did not install the pre-commit hook"
    return 1
  fi
}

no_agent_folders() {
  for excluded in .agents .claude/skills; do
    if [ -e "$excluded" ]; then
      echo "$excluded was copied into the module"
      return 1
    fi
  done
  find . -name node_modules -prune -o -path ./.git -prune -o -type f -print | sort
}

dev_until_ready() {
  setsid pnpm dev > "$logs/dev.log" 2>&1 &
  echo "$!" > "$dev_pid_file"
  for _ in $(seq 1 240); do
    if grep -q 'Hello world' "$logs/dev.log"; then
      grep 'Hello world' "$logs/dev.log"
      stop_dev
      return 0
    fi
    group_alive "$(cat "$dev_pid_file")" || break
    sleep 0.5
  done
  echo "pnpm dev never logged Hello world"
  return 1
}

snapshot() {
  git init -q -b main template
  git -C "$repo" ls-files -z --cached --others --exclude-standard \
    | (cd "$repo" && tar --null -T - -cf -) | tar -C template -xf -
  (cd template && git add -A && git -c user.name=verify-template-module-typescript -c user.email=verify-template-module-typescript@localhost commit -q -m snapshot)
  git init -q -b main catalog
  printf '{"starredInterfaces":[],"templates":[{"name":"Local template","repository":"%s","branch":"main"}]}\n' \
    "$work/template" > catalog/manifest.json
  (cd catalog && git add -A && git -c user.name=verify-template-module-typescript -c user.email=verify-template-module-typescript@localhost commit -q -m catalog)
}

cwd="$work" run_step snapshot snapshot
cwd="$work" run_step init "$ajs" module init app --git "$work/catalog" --template local-template --interfaces "" --pm pnpm --git-init
run_step scaffold-files no_agent_folders
run_step install install_deps
run_step build pnpm build
run_step first-commit commit
run_step checks pnpm run checks
run_step playground-build pnpm --dir playground build
run_step dev dev_until_ready
