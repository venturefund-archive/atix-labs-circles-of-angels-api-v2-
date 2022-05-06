#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  if [ "$SOLIDITY_COVERAGE" = true ]; then
    export RUNNING_COVERAGE=true
  else
    echo "Starting our own ganache instance"

    node_modules/.bin/ganache-cli -l 8000000 --port "$ganache_port" -m "fetch local valve black attend double eye excite planet primary install allow" > /dev/null &

    ganache_pid=$!

    echo "Waiting for ganache to launch on port "$ganache_port"..."

    while ! ganache_running; do
      sleep 0.1 # wait for 1/10 of the second before check again
    done

    echo "Ganache launched!"
  fi
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  start_ganache
fi

echo "Buidler version $(npx buidler --version)"

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/buidler coverage --network coverage "$@"
else
  node_modules/.bin/buidler test "$@"
fi