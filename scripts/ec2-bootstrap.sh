#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
ensure_credentials_exist

. "$IC_ROOT/build/credentials/runner.sh"

ssh -i "$pem_file" "$EC2_INSTANCE" << 'ENDSSH'
sudo apt update
# Nginx
sudo apt install --assume-yes nginx
sudo systemctl reload nginx
sudo chmod -R a+rw /etc/nginx

# Docker. See https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04
sudo apt install --assume-yes apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt update
apt-cache policy docker-ce
sudo apt install --assume-yes docker-ce
sudo usermod -aG docker ${USER}

# Certbot. See https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx
sudo apt-get install --assume-yes software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install --assume-yes certbot python-certbot-nginx
ENDSSH

scp -i "$pem_file" "$IC_ROOT/config/nginx/beta.conf" "$EC2_INSTANCE:/etc/nginx/conf.d/beta.conf"
scp -i "$pem_file" "$IC_ROOT/config/nginx/icompass.conf" "$EC2_INSTANCE:/etc/nginx/conf.d/icompass.conf"
