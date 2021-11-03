# Deployment

## AWS Set up

1. Spin up a t2.micro EC2 instance, with the Amazon Linux AMI.
1. Configure security group, and ensure the instance has permissions to log to CloudWatch.
1. Update `EC2_INSTANCE` in `runner.sh`
1. Run `./scripts/ec2-bootstrap`.
1. In Route 53, change the A-records of `icompass.me` and `beta.icompass.me` to point to the new instance's IP address.
1. Run `./scripts/deploy-staging`, and verify that staging environment is accessible at [https://beta.icompass.me](https://beta.icompass.me).
1. Run `./scripts/deploy-prod`, and verify production environment is accessible at [https://icompass.me](https://icompass.me).
