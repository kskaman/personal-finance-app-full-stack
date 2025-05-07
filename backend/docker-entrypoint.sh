#!/usr/bin/env sh
set -e

# If you have migrations, apply them; otherwise push your schema
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations)" ]; then
  echo " Applying migrations…"
  npx prisma migrate deploy
else
  echo "No migrations found—pushing schema instead…"
  npx prisma db push
fi

# Now seed (won't error if already seeded)
echo " Running seed…"
npx prisma db seed || echo "Seed script failed (maybe already ran)—continuing…"

# Finally hand off to the CMD in your Dockerfile
exec "$@"
