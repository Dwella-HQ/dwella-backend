#!/bin/bash
# Create application directory if it doesn't exist
set -e

# Remove the old deployment directory
if [ -d "/home/ec2-user/dwella-ng" ]; then
    echo "Removing old deployment..."
    rm -rf /home/ec2-user/dwella-ng
fi

sudo mkdir -p /home/ec2-user/dwella-ng