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

ensure_credentials_exist() {
    runner_file="$IC_ROOT/build/credentials/runner.sh"
    pem_file="$IC_ROOT/build/credentials/icompass.pem"

    if [[ ! -e "$runner_file" || ! -e "$pem_file" ]]; then
        echo -e "\n$runner_file and/or $pem_file does not exist.\n\nRun scripts/bootstrap.sh\n" >&2
        exit 1
    fi
}
