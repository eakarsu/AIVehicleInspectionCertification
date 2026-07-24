#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$project_dir/.env" ]] || { echo 'Missing .env; copy .env.example and provide real secrets.' >&2; exit 1; }
set -a
# shellcheck disable=SC1091
source "$project_dir/.env"
set +a
[[ -d "$project_dir/server/node_modules" && -d "$project_dir/client/node_modules" ]] || { echo 'Dependencies are missing; install them explicitly before starting.' >&2; exit 1; }
(cd "$project_dir/server" && SERVER_PORT="${SERVER_PORT:-${BACKEND_PORT:-3001}}" npm start) & backend_pid=$!
(cd "$project_dir/client" && PORT="${FRONTEND_PORT:-3000}" REACT_APP_API_BASE="http://127.0.0.1:${SERVER_PORT:-${BACKEND_PORT:-3001}}/api" BROWSER=none npm start) & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; }
trap cleanup INT TERM EXIT
wait "$backend_pid" "$frontend_pid"
