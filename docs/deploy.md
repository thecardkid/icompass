# Deployment

## AWS Set up

1. Spin up a t2.micro EC2 instance, with AMI `Ubuntu Server 16.04 LTS (HVM), SSD Volume Type - ami-0653e888ec96eab9b (64-bit x86) / ami-0b5f1bbaae8cd790f (64-bit Arm)
`.
1. Choose a security group that allows SSH, HTTP and HTTPS ingress.
1. Update `EC2_INSTANCE` in `runner.sh`
1. Run `./scripts/ec2-bootstrap`
1. Complete installing Certbot certificates by following [https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx](https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx), starting at `Get Started`.
1. In Route 53, change the A-records of `icompass.me` and `beta.icompass.me` to point to the new instance's IP address.
1. Run `./scripts/deploy-staging`, and verify that staging environment is accessible at [https://beta.icompass.me](https://beta.icompass.me).
1. Run `./scripts/deploy-prod`, and verify production environment is accessible at [https://icompass.me](https://icompass.me).

## Release procedure

1. Make sure all changes have landed on `develop`.
1. Tag the new release version: `git tag vA.B.C`.
1. (Optional) Dump the production logs for metrics `scripts/ec2-dump-logs`.
1. Merge to master: `git checkout master; git merge develop`.
1. (Optional) Deploy to staging: `scripts/deploy-staging`.
1. Deploy to prod: `scripts/deploy-prod`.
