# Insta Checkout — Agent Instructions

Follow these rules unless the user explicitly instructs otherwise.

## Critical Rules

- **Do NOT commit** any work until the user explicitly asks you to.
- **Do NOT deploy** any work until the user explicitly asks you to.
- **Do NOT push** to remote until the user explicitly asks you to.
- **Do NOT merge main** into the current branch unless the user explicitly asks you to.

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, STOP and re-plan immediately — don't keep pushing.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, throw more compute at it via subagents.
- One task per subagent for focused execution.

### 3. Self-Improvement Loop
- After ANY correction from the user: update memory files with the pattern.
- Write rules for yourself that prevent the same mistake.
- Review lessons at session start for relevant project.

### 4. Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip this for simple, obvious fixes — don't over-engineer.
- Challenge your own work before presenting it.

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding.
- Point at logs, errors, failing tests — then resolve them.
- Zero context switching required from the user.
- Go fix failing CI tests without being told how.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
- **Follow Existing Patterns**: Match the codebase's existing structures and conventions.

## Project-Specific Setup

### Worktree Setup
- After creating a worktree, always run `npx pnpm install` before attempting to build or run any app. This is required because workspace dependencies (like `@insta-checkout/i18n`) are not automatically linked in new worktrees.

### Worktree Naming
- Once you understand the task, rename the current worktree branch to a short, descriptive kebab-case name reflecting the task (e.g., `claude/fix-login-bug`, `claude/add-dark-mode`). Use `git branch -m <new-name>` to rename.

### Pulling Main
- At the start of each new session, always pull main (`git pull origin main`) to ensure you have the latest changes before starting any work.

### Dev Server Management
- At the start of each new conversation, close any active dev server sessions using `preview_stop` before starting a new one.
- When asked to run apps without preview, provide manual commands for the user to run in their terminal:
  - Landing: `npm run dev:landing` (port 3000)
  - Checkout: `npm run dev:checkout` (port 3001)
  - Backend: `npm run dev:backend` (port 4000)

### Notion
- When asked to view or check something in Notion, use the Notion connector and navigate to the Insta Checkout workspace: https://www.notion.so/karimtamer/Insta-Checkout-f555b3bf0c434947a1a37613eda62c1b

## Skills

- **Project-scoped only**: When creating any new skill, always create it under `.claude/skills/` in this project — never in the global `~/.claude/skills/` directory. All skills for Insta Checkout must be project-specific.

## Git & Commits

### Pre-commit Hook Strategy

When committing changes:

1. **Fix errors in your own code first** — ESLint, Prettier, TS errors in files you modified.


