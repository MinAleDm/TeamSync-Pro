#!/bin/sh
set -eu

cd /app

echo "Preparing database schema..."

attempt=0
max_attempts=30

until pnpm --filter @tracker/db exec prisma db push --skip-generate --accept-data-loss --schema prisma/schema.prisma; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database is still unavailable after ${max_attempts} attempts."
    exit 1
  fi

  echo "Database not ready yet, retrying in 2s..."
  sleep 2
done

echo "Seeding demo data..."
pnpm --filter @tracker/db prisma:seed

echo "Starting API..."
exec node /app/apps/api/dist/main.js
