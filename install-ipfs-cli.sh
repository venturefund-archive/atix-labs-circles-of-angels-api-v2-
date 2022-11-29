#!/bin/bash
echo "Downloading Linux binary"
wget https://dist.ipfs.tech/kubo/v0.17.0/kubo_v0.17.0_linux-amd64.tar.gz
echo "Unzipping file"
tar -xvzf kubo_v0.17.0_linux-amd64.tar.gz
echo "Running install script"
cd kubo && sudo bash install.sh
echo "IPFS installed, version: $(ipfs --version)"
echo "Starting ipfs daemon..."
ipfs daemon