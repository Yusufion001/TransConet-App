#!/bin/bash

npx tsx src/server.ts &
SERVER_PID=$!

npx tsx src/worker.ts &
WORKER_PID=$!

trap "kill -TERM $SERVER_PID $WORKER_PID" SIGINT SIGTERM EXIT
wait $SERVER_PID $WORKER_PID
