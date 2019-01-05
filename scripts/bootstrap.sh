#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
ensure_brew_installed

ensure_bitwarden_cli_installed() {
    set +e
        which -s bw
        if [[ $? != 0 ]]; then
            echo "bitwarden-cli not installed. Installing with homebrew.." >&2
            brew install bitwarden-cli
        fi
    set -e
}

ensure_jq_installed() {
    set +e
        which -s jq
        if [[ $? != 0 ]]; then
            echo "jq not installed. Installing with homebrew.." >&2
            brew install jq
        fi
    set -e
}

setup_credentials() {
    echo -e "setting up credentials..\n" >&2
    sleep 1

    ensure_bitwarden_cli_installed
    ensure_jq_installed

    # Bitwarden-CLI does not have a way to check if the user
    # is logged in, see https://github.com/bitwarden/cli/issues/27
    # So it's okay to allow exit code 1 here
    set +e
        bw logout
    set -e
    local session_key="$(bw login --raw)"

    local creds_dir="$IC_ROOT/build/credentials"
    rm -rf "$creds_dir"
    mkdir -p "$creds_dir"

    echo "Retrieving SSH key.." >&2
    local pem_contents="$(bw get item "6ef1ab62-129b-43c9-8d3f-a9c80168909e" --session ${session_key} | jq -r .notes)"
    echo -e "$pem_contents" > "$creds_dir/icompass.pem"
    chmod 400 "$creds_dir/icompass.pem"

    echo "Retrieving environment variables.." >&2
    local runner_sh_contents="$(bw get item "c335b8e6-a8cb-45ec-9a8c-a9c30035dbd1" --session ${session_key} | jq -r .notes)"
    echo -e "$runner_sh_contents" > "$creds_dir/runner.sh"
    chmod +x "$creds_dir/runner.sh"
}

ensure_nvm_installed() {
    set +u
        if [[ -z "$NVM_DIR" ]]; then
            echo -e "nvm is not installed. Please run \"brew install nvm\"" >&2
        fi
    set -u
}

setup_node_env() {
    echo -e "installing npm packages..\n" >&2
    if [[ -d "$IC_ROOT/node_modules" ]]; then
        echo "removing old node_modules/" >&2
        rm -r "$IC_ROOT/node_modules/"
    fi
    # webdriverio uses wdio-sync to execute commands synchronously.
    # wdio-sync depends on the fibers package.
    # According to https://github.com/laverdet/node-fibers/issues/378#issuecomment-402384739,
    # the fibers installation will fail if node is earlier than v4
    # or later than v6. However, Travis has been running with
    # node 8.15 and npm 6.4.1. So we can just use that set up instead.
    echo "ensuring node and npm versions are compatible for fibers installation.." >&2
    ensure_nvm_installed
    # This will install node@8.15 and npm@6.4.1
    . $(brew --prefix nvm)/nvm.sh
    nvm install 8
    echo "installing npm packages.." >&2
    npm install --depth 0
}

setup_credentials
setup_node_env
