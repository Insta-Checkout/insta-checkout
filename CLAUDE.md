# Insta Checkout - Claude Instructions

## Worktree Setup
- After creating a worktree, always run `npx pnpm install` before attempting to build or run any app. This is required because workspace dependencies (like `@insta-checkout/i18n`) are not automatically linked in new worktrees.

## Worktree Naming
- Once you understand what the user's task is about, rename the current worktree branch to a short, descriptive kebab-case name reflecting the task (e.g., `claude/fix-login-bug`, `claude/add-dark-mode`). Use `git branch -m <new-name>` to rename.
