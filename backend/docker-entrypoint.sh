#!/usr/bin/env sh
set -e

echo "Applying migrations…"
npx prisma migrate deploy         # does nothing if no migrations yet

# optional seed (guard it if your seed expects tables)
echo "Running seed…"
npx prisma db seed || echo "Seed script failed—continuing…"

exec "$@"