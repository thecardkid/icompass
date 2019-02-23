#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
ensure_credentials_exist

# Any update to this file should be made to ./deploy-staging.sh too
. "$IC_ROOT/build/credentials/runner.sh"

scp -i "$pem_file" "$IC_ROOT/build/credentials/prod.env" "$EC2_INSTANCE:~/prod.env"

ssh -i "$pem_file" "$EC2_INSTANCE" << 'ENDSSH'
sudo docker pull thecardkid/icompass:latest
sudo docker container kill production
sudo docker container prune --force
docker images -qf dangling=true | xargs docker rmi
sudo docker run -p 8080:8080 --name production --env-file prod-env --detach thecardkid/icompass:latest
ENDSSH
