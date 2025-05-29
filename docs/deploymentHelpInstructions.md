# 🚀 Fly.io Deployment Guide — Backend + Frontend

**Prod Branch · May 2025**

---

## Repo Layout

```
repo-root/
│
├── backend/      # Node.js + Prisma API
└── frontend/     # Vite React SPA
```

---

## 🐘 Step 1: Create Managed Postgres

```bash
fly postgres create --name finance-db-kaman --region lax
```

- Copy the provided `DATABASE_URL`
  ```
  postgresql://<user>:<pass>@finance-db-kaman.internal:5432/<db>?schema=public
  ```

---

## 🧠 Step 2: Launch Backend App

```bash
cd backend
fly launch --name personal-finance-backend --region lax --dockerfile Dockerfile --no-deploy
```

- If prompted about `.dockerignore`, select **No**
- It creates `fly.toml` with correct app name

---

## Step 3: Set Backend Secrets

```bash
fly secrets set \
  PORT=3000 \
  NODE_ENV=production \
  FRONTEND_URL=https://<your-frontend>.vercel.app \
  BACKEND_URL=https://personal-finance-backend.fly.dev \
  DATABASE_URL="postgresql://<user>:<pass>@finance-db-kaman.internal:5432/<db>?schema=public" \
  REDIS_URL="redis://default@finance-redis.internal:6379" \
  EMAIL_HOST=smtp.gmail.com \
  EMAIL_PORT=587 \
  EMAIL_USER=your@email.com \
  EMAIL_PASS=your-app-password \
  -a personal-finance-backend
```

---

## Step 4: Deploy Backend

```bash
fly deploy -a personal-finance-backend
```

Confirm:

```bash
fly status -a personal-finance-backend
```

---

## 🔁 Step 5: Redis on Fly.io

```bash
fly launch --name finance-redis --image redis:7-alpine --region lax
fly deploy -a finance-redis
```

Confirm Redis is listening on port 6379 and `finance-redis.internal` is reachable.

---

## 💻 Step 6: Deploy Frontend to Vercel

- Go to [vercel.com](https://vercel.com)
- Select GitHub repo and prod branch
- In build settings:
  - Root directory: `frontend`
  - Set env `VITE_BACKEND_URL=https://personal-finance-backend.fly.dev`

---

## 🔧 Optional: GitHub Actions for Backend CI/CD

- Add the following file:

```
backend/.github/workflows/deploy.yml
```

```yaml
name: Fly Deploy

on:
  push:
    branches:
      - prod

jobs:
  deploy:
    name: Deploy App
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only --app personal-finance-backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## Useful Debugging Commands

```bash
fly status -a personal-finance-backend
fly logs -a personal-finance-backend
fly ssh console -a personal-finance-backend
fly deploy -a personal-finance-backend
fly secrets list -a personal-finance-backend
```

For Redis:

```bash
fly ssh console -a finance-redis
redis-cli -h 127.0.0.1 ping
```

---

## Common Gotchas

- `PORT` must match `fly.toml` and listen on `0.0.0.0`
- Always deploy from the correct folder (e.g. `cd backend`)
- If frontend is not working, verify Vercel env vars
- Forgot seed? Run:
  ```bash
  fly ssh console -a personal-finance-backend
  npx prisma db seed
  ```
