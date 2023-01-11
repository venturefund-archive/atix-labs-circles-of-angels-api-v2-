#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the buidler node instance that we started (if we started one and if it's still running).
  if [ -n "$buidler_node_pid" ] && ps -p $buidler_node_pid > /dev/null; then
    kill -9 $buidler_node_pid
  fi
}

buidler_node_port=8545

buidler_node_running() {
  nc -z localhost "$buidler_node_port"
}

start_buidler_node() {
  if [ "$SOLIDITY_COVERAGE" = true ]; then
    export RUNNING_COVERAGE=true
  else
    echo "Starting our own buidler node instance"

    node_modules/.bin/buidler node --port "$buidler_node_port" > /dev/null &

    buidler_node_pid=$!

    echo "Waiting for buidler node to launch on port "$buidler_node_port"..."

    while ! buidler_node_running; do
      sleep 0.1 # wait for 1/10 of the second before check again
    done

    echo "Buidler node launched!"
  fi
}

if buidler_node_running; then
  echo "Using existing buidler node instance"
else
  start_buidler_node
fi

echo "Buidler version $(npx buidler --version)"

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/buidler coverage --network coverage "$@"
else
  node_modules/.bin/buidler test "$@"
fi