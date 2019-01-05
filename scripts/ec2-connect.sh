#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
ensure_credentials_exist

. "$IC_ROOT/build/credentials/runner.sh"
ssh -i "$pem_file" "$EC2_INSTANCE"
