#!/usr/bin/env bash
set -euo pipefail

export IC_ROOT="$(unset CDPATH;cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"

ensure_brew_installed() {
    set +e
        which -s brew
        if [[ $? != 0 ]]; then
            echo -e "Homebrew not installed. Go here: https://brew.sh/" >&2
        fi
    set -e
}
