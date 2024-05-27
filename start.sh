#!/bin/sh

# Navigate to the backend directory and install dependencies
cd backend
pnpm install

# Navigate to the frontend directory and install dependencies
cd ../frontend
pnpm install

# Navigate back to the root directory
cd ..

# Run both backend and frontend servers concurrently
npx concurrently "cd backend && pnpm start" "cd frontend && pnpm dev"
