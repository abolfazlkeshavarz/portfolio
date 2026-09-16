#!/usr/bin/env bash
#
# Shared helpers sourced by the other scripts. Not meant to be run directly.

# ---------------------------------------------------------------------------
# load_env <file>
#
# Loads a .env-style file WITHOUT using `source`/`.`, which executes every line
# as a shell command. A stray line that isn't a comment or a KEY=VALUE
# assignment would otherwise run as a command and crash with "command not
# found". Only well-formed assignments are exported; anything else warns.
# ---------------------------------------------------------------------------
load_env() {
  local file="${1:-.env}"
  if [[ ! -f "$file" ]]; then
    echo "Error: $file not found. Run: make setup" >&2
    return 1
  fi
  set -a
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line"
    else
      echo "Warning: ignoring malformed line in $file: $line" >&2
    fi
  done < "$file"
  set +a
}

# ---------------------------------------------------------------------------
# port_in_use <port>
#
# True if anything is already listening on this host port. docker-proxy binds
# published ports at the OS level like any other process, so a container from
# an unrelated project collides just the same and `ss` sees both.
# ---------------------------------------------------------------------------
port_in_use() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    ss -Htln "( sport = :$port )" 2>/dev/null | grep -q .
    return $?
  fi

  (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null && { exec 3>&-; return 0; }
  return 1
}

# ---------------------------------------------------------------------------
# find_free_port <start>
#
# First free port at or above <start>. Used to pick a localhost-only port for
# this project's container when other projects already run on this server, so
# deployment proceeds instead of failing on "port is already allocated".
# ---------------------------------------------------------------------------
find_free_port() {
  local port="${1:-8093}"
  while port_in_use "$port"; do
    port=$((port + 1))
  done
  echo "$port"
}

# ---------------------------------------------------------------------------
# port_owner <port>
#
# Name of the process listening on a host port ("nginx", "docker-proxy", ...),
# or empty. "Something already has 443" is two situations with opposite fixes:
# nginx is the reverse proxy we want (just add a vhost); docker-proxy means a
# container published it and host nginx cannot bind it until that is resolved.
# Needs root to see other users' socket owners; without it, returns empty and
# callers treat that as "unknown".
# ---------------------------------------------------------------------------
port_owner() {
  local port="$1"
  command -v ss >/dev/null 2>&1 || return 0

  ss -Htlnp "( sport = :$port )" 2>/dev/null \
    | grep -oE 'users:\(\("[^"]+"' \
    | head -1 \
    | sed -E 's/.*"([^"]+)"/\1/'
}
