# Insta Checkout - Claude Instructions

## Worktree Setup
- After creating a worktree, always run `npx pnpm install` before attempting to build or run any app. This is required because workspace dependencies (like `@insta-checkout/i18n`) are not automatically linked in new worktrees.

## Worktree Naming
- Once you understand what the user's task is about, rename the current worktree branch to a short, descriptive kebab-case name reflecting the task (e.g., `claude/fix-login-bug`, `claude/add-dark-mode`). Use `git branch -m <new-name>` to rename.

## Notion
- When asked to view or check something in Notion, use the Notion connector and navigate to the Insta Checkout workspace: https://www.notion.so/karimtamer/Insta-Checkout-f555b3bf0c434947a1a37613eda62c1b

## Dev Server Management
- At the start of each new conversation, always close any active dev server sessions using `preview_stop` before starting a new one. This ensures clean state and prevents port conflicts.
- When asked to run apps without preview, provide the manual commands for the user to run in their own terminal instead of using preview tools. This keeps Claude lightweight and the user maintains full control:
  - Landing: `npm run dev:landing` (port 3000)
  - Checkout: `npm run dev:checkout` (port 3001)
  - Backend: `npm run dev:backend` (port 4000)

## Pulling Main
- At the start of each new session, always pull main (`git pull origin main`) to ensure you have the latest changes before starting any work. This prevents conflicts and keeps your work in sync with the team.
