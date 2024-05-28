#!/bin/sh

backend="node"

while [ "$1" != "" ]; do
    case $1 in
        --backend ) shift
                    backend=$1
                    ;;
    esac
    shift
done

cd backend
pnpm install

cd ../frontend
pnpm install

cd ..

if [ "$backend" = "go" ]; then
  echo "Running Go backend"
  cd go-backend
  go mod tidy
  go run .
else
  echo "Running Node.js backend"
  cd backend
  pnpm start
fi &

cd frontend
pnpm dev
