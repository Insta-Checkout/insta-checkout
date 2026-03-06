# Local Development Commands

Use these commands to run InstaCheckout locally.

## 1) Configure backend

Ensure `apps/backend/.env` has `MONGODB_URI` set (typically to Atlas). No local MongoDB is required.

## 2) Start apps

Run each service in its own terminal:

```bash
npx pnpm --filter landing dev
npx pnpm --filter checkout dev
npx pnpm --filter backend dev
```

The backend reads `MONGODB_URI` from `.env` and connects to Atlas.

## 3) Optional checks

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/health/db
```

## 4) Stop services

Stop frontend/backend terminals with Ctrl+C.
