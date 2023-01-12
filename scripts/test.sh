#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the hardhat node instance that we started (if we started one and if it's still running).
  if [ -n "$hardhat_node_pid" ] && ps -p $hardhat_node_pid > /dev/null; then
    kill -9 $hardhat_node_pid
  fi
}

hardhat_node_port=8545

hardhat_node_running() {
  nc -z localhost "$hardhat_node_port"
}

start_hardhat_node() {
  if [ "$SOLIDITY_COVERAGE" = true ]; then
    export RUNNING_COVERAGE=true
  else
    echo "Starting our own hardhat node instance"

    node_modules/.bin/hardhat node --port "$hardhat_node_port" > /dev/null &

    hardhat_node_pid=$!

    echo "Waiting for hardhat node to launch on port "$hardhat_node_port"..."

    while ! hardhat_node_running; do
      sleep 0.1 # wait for 1/10 of the second before check again
    done

    echo "Hardhat node launched!"
  fi
}

if hardhat_node_running; then
  echo "Using existing hardhat node instance"
else
  start_hardhat_node
fi

echo "Hardhat version $(npx hardhat --version)"

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/hardhat coverage --network coverage "$@"
else
  node_modules/.bin/hardhat test "$@"
fi