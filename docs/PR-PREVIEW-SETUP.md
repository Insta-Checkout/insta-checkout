# PR Preview Setup: Railway Backend + Vercel Frontend

This guide explains how to connect Railway PR environments (per-PR backend) with Vercel preview deployments (per-PR frontend) so each feature branch gets its own full-stack preview.

## Overview

1. **Railway** deploys a backend for each PR and posts the URL in a GitHub PR comment.
2. **GitHub Action** (`sync-pr-backend-to-vercel`) runs when that comment appears, extracts the backend URL, and configures Vercel.
3. **Vercel** redeploys the frontend with `NEXT_PUBLIC_BACKEND_URL` set to the PR’s backend URL.

## Step 1: Enable Railway PR Environments

1. Open your Railway project.
2. Go to **Project Settings** → **Environments**.
3. Turn on **Enable PR Environments**.
4. Ensure your backend service has a **Railway domain** in the base (production) environment:
  - Service → **Settings** → **Networking** → **Generate domain**.
  - PR environments only get domains if the base environment has one.

## Step 2: Add GitHub Secrets

In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**.


| Secret           | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `VERCEL_TOKEN`   | Vercel API token. Create at [vercel.com/account/tokens](https://vercel.com/account/tokens) with full access. |
| `VERCEL_TEAM_ID` | (Optional) Your Vercel team ID. Omit for a personal account. Find it in Team Settings → General.             |


## Step 3: Configure Vercel Project(s)

If you have multiple frontend projects (e.g. landing + checkout), set a repo variable:

1. **Settings** → **Secrets and variables** → **Actions** → **Variables**.
2. Add `VERCEL_PROJECT_IDS` with a comma-separated list of project names/IDs, e.g. `landing,checkout`.

If you have a single Vercel project, the workflow defaults to `instacheckout`. Adjust the default in the workflow file if needed.

## Step 4: Backend CORS

The backend has been updated to allow Vercel preview origins (`*.vercel.app`). If you use custom preview domains, add them via the `CORS_ORIGINS` env var in Railway.

## Flow

1. Open a PR from a feature branch.
2. Railway creates a PR environment and deploys the backend.
3. Railway’s bot comments on the PR with the deployment URL.
4. The GitHub Action runs on that comment, extracts the backend URL, sets `NEXT_PUBLIC_BACKEND_URL` for that branch in Vercel, and triggers a redeploy.
5. The Vercel preview uses the PR backend URL.

## Troubleshooting

### Action doesn’t run

- Ensure the workflow file is on the default branch (usually `main`).
- Confirm Railway’s bot can comment (it must have access to the repo).

### Wrong backend URL extracted

- The workflow uses the first `*.railway.app` URL in the comment.
- If you have multiple services, ensure the backend is the first one in Railway’s table, or adjust the regex in the workflow.

### Vercel redeploy fails

- Check that `VERCEL_TOKEN` has the right permissions.
- For teams, set `VERCEL_TEAM_ID`.
- Confirm `VERCEL_PROJECT_IDS` matches your project names in Vercel.

### CORS errors in the browser

- Verify the backend allows `*.vercel.app` (already configured).
- For custom domains, add them to `CORS_ORIGINS` in Railway.

