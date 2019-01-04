#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

runner_file="$IC_ROOT/build/credentials/runner.sh"
pem_file="$IC_ROOT/build/credentials/icompass.pem"

if [[ ! -e "$runner_file" || ! -e "$pem_file" ]]; then
    echo -e "\n$runner_file and/or $pem_file does not exist.\n\nRun scripts/bootstrap.sh\n" >&2
    exit 1
fi

. "$runner_file"
ssh -i "$pem_file" "$EC2_INSTANCE"
