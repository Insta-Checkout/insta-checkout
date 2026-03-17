---
name: night-shift
description: "Run an autonomous Night Shift coding session for Insta Checkout. Reads Groomed tasks from the Notion Development Launch Board, implements them with test-first headless QA validation, runs 6 reviewer sub-agents, commits to a single session branch, and writes Agent Reports on each Notion task card. Trigger this skill whenever the user says 'night shift', 'run night shift', 'autonomous mode', 'start night shift', '/night-shift', or wants to run an autonomous coding session that picks up tasks from Notion. Also trigger when the user wants the agent to work through multiple tasks independently, even if they don't use the exact phrase 'night shift'."
---

# Night Shift — Autonomous Agent Session

Run an autonomous coding session that picks Groomed tasks from Notion, implements them, validates with headless QA, reviews with 6 sub-agents, and reports back to Notion. All work goes into a single branch per session.

---

## Pre-flight

Before starting the loop, check that **bypass permissions mode** is enabled. If it's not, ask the user to enable it before proceeding — the session will stall on permission prompts otherwise.

### Check for session assignment

The user may provide a **session assignment** from `/night-shift-plan`. This looks like:

> Session tasks: #XX, #YY, #ZZ
> Branch: claude/night-shift-YYYY-MM-DD-sN

If a session assignment is provided:
- Use the specified branch name (not the default)
- Only work on the assigned task IDs — do not query the board for other tasks
- Pick tasks in the order listed

If NO session assignment is provided:
- Fall back to the original behavior: query the board and pick Groomed tasks top to bottom

Then confirm with the user:

> Starting Night Shift session. I will:
> 1. {Pick assigned tasks / Pick Groomed tasks from the board (top to bottom)}
> 2. Implement, validate with headless QA, and review with 6 personas
> 3. Commit all work to `{branch name}`
> 4. Write Agent Reports on each Notion task card
> 5. Create a PR at session end
> 6. Verify all Vercel deployments pass — fix any failures automatically
>
> Shall I proceed?

Wait for explicit confirmation before continuing.

---

## Phase 0: Initialize

1. Prevent Mac from sleeping during the session:
   ```bash
   caffeinate -dims &
   CAFFEINATE_PID=$!
   ```
   This keeps the display, disk, and system awake until we kill it at session end.

2. Ensure we're on main and up to date:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Read session config from `.claude/skills/night-shift/config.md`

3. Create the session branch:
   ```bash
   # Use the assigned branch name if provided, otherwise default:
   git checkout -b claude/night-shift-$(date +%Y-%m-%d)
   # If session assignment specified a branch like claude/night-shift-2026-03-17-s2, use that instead
   ```

4. Read reviewer personas from `.claude/skills/night-shift/REVIEW_PERSONAS.md`

---

## Phase 1: Pick Task

Query the Development Launch Board for eligible tasks.

### How to query

Use `notion-query-database-view` with view ID:
```
view://f8ad4f5b-1e21-42b8-bf8f-600cd4cb1912
```

### Task selection rules

Filter for tasks where `Task status` = "✅ Groomed".

Pick order: **top to bottom** as they appear in the Groomed column. The board is already ordered by the user — just take the next Groomed task from the top of the list.

If no Groomed tasks remain, skip to Phase 8 (Session End).

### After picking a task

1. Update the task status to "🚧 In Progress" via `notion-update-page`
2. Fetch the full task page content — this IS the spec
3. **Check for comments** — Use `notion-get-comments` on the task page. If there are comments from the user (Karim), this may be a previously implemented task that needs adjustments:
   - Read the user's comment carefully
   - Check the existing implementation in the codebase
   - Apply the changes requested in the comment
   - **Reply with a Notion comment** (via `notion-create-comment`) explaining what you changed — do NOT write an Agent Report for comment-driven changes
   - Update the task status to "🔍 To Be Reviewed" and move to the next task

---

## Phase 2: Load Context

The task's Notion page body contains the spec. Read it carefully.

### Check for `@agent` instructions

Scan the task description for any text prefixed with `@agent`. These are direct instructions from the user to the agent — they may ask for information, request a specific approach, or add constraints. Track all `@agent` instructions found and address each one during implementation. The results will be included in the Agent Report under an **"Agent Answers"** section (see Phase 7).

Based on the task's **Category**, load the relevant app instructions and Notion reference docs:

| Category | Local docs to read | Notion docs to fetch |
|----------|-------------------|---------------------|
| **Backend** | `apps/backend/CLAUDE.md` | API Documentation, MVP Scope |
| **Landing App** | `apps/landing/CLAUDE.md` | Design System, Brand Guidelines, Brand Voice |
| **Checkout App** | `apps/checkout/CLAUDE.md` | Checkout UX Spec, Design System, Brand Guidelines |
| **Design** | `apps/landing/CLAUDE.md` or `apps/checkout/CLAUDE.md` | Design System, Brand Guidelines |
| **Infrastructure** | Root `CLAUDE.md` | MVP Scope |
| **WhatsApp Bot** | Root `CLAUDE.md` | Product Vision |

### Notion Reference Doc IDs

Only fetch docs relevant to the current task — don't waste context loading everything.

| Document | Page ID |
|----------|---------|
| Product Vision & UX | `e7148c5a8b6b4c78a329d4a219486e13` |
| MVP Scope & Architecture | `7a2dd9ad12a84d5b9d37d3f724516069` |
| Checkout Page UX Spec | `ba72ceb860c3430382ca5101ac1c68bd` |
| API Documentation | `1cc606c6eb024bffa94633079f005478` |
| Design System | `31dc92f98d9c81cca707e5afa6b0d1f7` |
| Brand Guidelines | `31dc92f98d9c815c9063c80e2ba6667e` |
| Brand Voice Guide | `31cc92f98d9c81acbb1ae8cfd0e217b4` |
| E2E Testing Spec | `aad7dc7c2ccf4e7da22be2ba5e979361` |

---

## Phase 2.5: Extract Requirements Checklist

Before writing any code, systematically extract **every discrete requirement** from the spec into a numbered checklist. This prevents requirements from getting lost in long specs.

### How to extract

Read the full task spec and produce a checklist like:

```
Requirements for Task #XX:
[  ] 1. <specific requirement from spec>
[  ] 2. <specific requirement from spec>
[  ] 3. <specific UI behavior described>
[  ] 4. <specific edge case mentioned>
[  ] 5. <i18n string needed>
...
```

### What counts as a requirement

Focus on the **"1. General Idea"** section — this is the source of truth. The "2. Implementation Steps" section is just guidance for how to build it; the agent may deviate if it finds a better approach.

- Each checkbox item (`- [ ]` or `- [x]`) under "General Idea"
- Each acceptance criterion or behavioral detail within those checkboxes
- Each `@agent` instruction
- Each i18n implication (if user-facing strings are described, both EN and AR are needed)

### Track with todos

Add each extracted requirement as a todo item. Mark each as completed only after the code implementing it is written and verified. **After implementation (end of Phase 4), go back through the checklist and verify every item is addressed.** Any missed items must be implemented before proceeding to Phase 5.

---

## Phase 3: Plan

Analyze the codebase for the specific area being changed. Understand the existing patterns before writing any code.

### If the spec is ambiguous or incomplete

Don't guess. Instead:
1. Leave a comment on the Notion task via `notion-create-comment` explaining what's unclear
2. Skip this task and go back to Phase 1 to pick the next one
3. Log the skip in the session notes

### If the spec is clear

Develop a mental plan: what files to change, what the acceptance criteria are, and what could go wrong. You don't need to write this down — the reviewers will catch issues later.

---

## Phase 4: Implement

Write the code following existing codebase patterns.

### Rules
- **UI tasks**: Invoke the `frontend-design` skill — this is mandatory for any Landing App, Checkout App, or Design category task
- **Backend tasks**: Follow the patterns in `apps/backend/CLAUDE.md` (thin route handlers, service layer, Zod validation)
- **i18n**: All user-facing strings must go through `@insta-checkout/i18n`
- **No new dependencies** unless the task spec explicitly requests them

### After implementing
1. Run linting for affected apps
2. Run TypeScript type checking
3. Fix any errors before proceeding

---

## Phase 5: Validate (Headless QA)

This phase runs headless browser tests to validate the implementation actually works. The QA output feeds into the Agent Report on the Notion card, so this must run before reporting.

### Setup

Find the gstack browse binary:
```bash
B=~/.claude/skills/gstack/browse/dist/browse
```

Start the relevant dev server based on the task category. **Important:** The default ports may already be in use by the user's own processes. Never kill existing processes — instead, find a free port and start the app there.

```bash
# 1. Check if the default port is already in use
#    Landing App default: 3000, Checkout App: 3001, Backend: 4000

# 2. If the port is occupied, find a free port and use it instead
#    For Next.js apps, use the -p flag: next dev -p <free-port>
#    For the backend, set PORT env var: PORT=<free-port> npm run dev:backend

# Example: Landing App
if lsof -ti:3000 >/dev/null 2>&1; then
  # Port 3000 is busy — find a free one
  DEV_PORT=$(python3 -c 'import socket; s=socket.socket(); s.bind(("",0)); print(s.getsockname()[1]); s.close()')
  npx next dev -p $DEV_PORT --dir apps/landing &
else
  npm run dev:landing &
  DEV_PORT=3000
fi
DEV_PID=$!
```

3. **Wait for the server to be ready** — poll the port until it responds before proceeding. Don't assume it's ready immediately.
4. **Verify it's the right app** — navigate to the root URL with the browse binary and confirm the expected app is running (check page title or a known element).
5. **Use `$DEV_PORT` for all subsequent test URLs** — never hardcode the port number.

### Authenticate if needed

If the app requires login, read test credentials from `.claude/.env`:
```bash
source .claude/.env
# Uses $INSTA_CHECKOUT_TEST_EMAIL and $INSTA_CHECKOUT_TEST_PASSWORD
```

Navigate to the login page and authenticate via the headless browser using these credentials before running tests.

### Generate and run test cases

1. **Analyze the diff**: `git diff main...HEAD --name-only` to identify changed files and affected routes
2. **Generate 5-20 test cases** based on the diff + task spec (enough to cover all scenarios):
   - Happy path (the main feature works as specified)
   - Edge cases (from the spec's acceptance criteria)
   - Regressions (existing features on affected pages still work)
3. **Execute each test** using the browse binary:
   ```bash
   $B goto http://localhost:$DEV_PORT/affected-route
   $B snapshot -i          # interactive elements
   $B click @e3            # interact with elements
   $B screenshot -o .gstack/qa-reports/test-001.png
   ```
4. **After each interaction**: check console errors (`$B console`), check for network failures (`$B network`)
5. **Never stop on failure** — run all test cases regardless

### Health score

Calculate after all tests complete:
- Start at **100**
- **-15** per failing test case
- **-5** per console error (capped at -20 total for console errors)
- **-5** per broken network request (capped at -15 total)
- **-10** per regression (existing feature broken)

### Save output

Write the QA report to `.gstack/qa-reports/qa-report-night-shift-TASK_ID.md` with:
- Health score
- Test case results (pass/fail with descriptions)
- Console errors found
- Screenshot paths

### Add regression tests

After all task-specific tests pass, add **general regression tests** to the global test suite at `.gstack/regression-tests/`. These tests should be reusable and runnable independently of the current task.

1. **Read the existing regression suite** — check `.gstack/regression-tests/regression-suite.md` for existing test cases (create the file if it doesn't exist)
2. **Add 1-3 new regression test cases** based on what this task touched:
   - Focus on the happy path of the feature/fix — something that should always work
   - Write each test as a reproducible sequence of headless browser commands
   - Include the expected outcome for each step
3. **Append to the suite file** — don't overwrite existing tests. Format:

```markdown
### RT-<number>: <short description>
- **Added by:** Task #<task-id>
- **Route:** /path/to/test
- **Steps:**
  1. Navigate to <URL>
  2. <interaction>
  3. Assert <expected outcome>
- **Pass criteria:** <what constitutes a pass>
```

4. **Run all existing regression tests** to make sure nothing is broken. Log any failures.

### Cleanup

Kill the dev server when done:
```bash
kill $DEV_PID 2>/dev/null
```

---

## Phase 6: Review (7 Sub-Agents)

Run each reviewer persona from `REVIEW_PERSONAS.md` as a sub-agent. Reviewers analyze the **code**, not the live app (the dev server is already stopped). Each reviewer gets:
- The full `git diff` of changes for this task
- The task spec (from Notion)
- The QA report from Phase 5 (health score, test results, screenshots) — so reviewers can reference actual app behavior without needing a running server
- Their specific reference docs (listed in REVIEW_PERSONAS.md)

### Spec Compliance reviewer (runs first)

Before spawning the 6 quality reviewers, run the **Spec Compliance** reviewer. This reviewer gets:
- The **raw Notion spec** (full task page content)
- The **requirements checklist** from Phase 2.5
- The **full git diff**

Its sole job is to answer: **"Is every requirement in the spec addressed in the code?"** It goes line by line through the spec and checklist, checking each requirement against the diff. It outputs:

```
PASS or FAIL
- [MISSING] Requirement #3: "Add buyer name field to Step 2" — not found in diff
- [PARTIAL] Requirement #7: "Show buyer name in landing app" — component updated but i18n string missing for AR
- [MET] Requirement #1: "Fix CORS allowedOrigins" — pay.instacheckouteg.com added at index.ts:15
```

If the Spec Compliance reviewer returns `FAIL`:
- Implement the missing/partial requirements immediately
- Re-run the Spec Compliance reviewer (max 2 retries)
- Only proceed to the 6 quality reviewers after it returns `PASS`

### Quality review process

1. Spawn each of the 6 quality reviewers as a sub-agent with their persona prompt
2. Each reviewer outputs either `APPROVE` or `REQUEST_CHANGES` with specific file:line references
3. If ANY reviewer returns `REQUEST_CHANGES`:
   - Apply the feedback
   - Re-run only the reviewers that had changes (not all 6)
   - Maximum 3 review rounds total
4. If after 3 rounds a reviewer still has concerns:
   - Log the unresolved concerns
   - Mark the task as `NEEDS_HUMAN_REVIEW` in the Agent Report
   - Continue to Phase 7 anyway — don't get stuck

---

## Phase 7: Commit & Report

### Commit

Stage and commit with a descriptive message:
```
feat|fix|chore(<app>): <description>

Notion Task: #<task-id> - <task-title>
```

### Write Agent Report on Notion Task Card

Read the QA report from `.gstack/qa-reports/` and combine with reviewer verdicts.

Use `notion-update-page` to append a toggle heading "Agent Report" to the task page. The report structure:

```markdown
## Agent Report

- Branch: `claude/night-shift-YYYY-MM-DD`
- PR: <link to the GitHub PR>
- Commits: <number of commits for this task>

### Changes Made
- <bullet point summary of what was implemented>

### QA Validation
- Health Score: **<score>/100**
- Console Errors: <count>

#### Test Cases
| # | Description | Result |
|---|-------------|--------|
| 1 | <test case description> | PASS/FAIL |
| 2 | <test case description> | PASS/FAIL |
| ... | ... | ... |

### Spec Compliance
- Result: **PASS/FAIL**
- Requirements met: X/Y
- Missing: <list any missing requirements, or "None">

### Reviewer Verdicts
| Persona | Verdict | Notes |
|---------|---------|-------|
| Spec Compliance | PASS/FAIL | X/Y requirements met |
| UX Designer | APPROVE/REQUEST_CHANGES | <brief note> |
| Architect | APPROVE/REQUEST_CHANGES | <brief note> |
| Domain Expert | APPROVE/REQUEST_CHANGES | <brief note> |
| Code Quality | APPROVE/REQUEST_CHANGES | <brief note> |
| Performance | APPROVE/REQUEST_CHANGES | <brief note> |
| Human Advocate | APPROVE/REQUEST_CHANGES | <brief note> |

### Agent Answers
<!-- Only include this section if the task description contained @agent instructions -->
| Instruction | Answer |
|-------------|--------|
| <@agent instruction from the spec> | <what the agent did or found> |

### Blockers / Follow-ups
- <any unresolved issues or things for human review>
```

### Update task status

Update the Notion task status to "🔍 To Be Reviewed" via `notion-update-page`.

---

## Phase 8: Loop or End

### Context management

- At **~70% context consumed**: run `/compact` to free up space, then continue
- At **~90% context consumed**: hard stop — proceed to session end regardless of remaining tasks

### Large task detection

Before starting a task, estimate its scope. If a task involves **scaffolding a new app**, **creating 10+ new files**, or would consume more than ~40% of remaining context, do NOT skip it — instead:

1. Commit and push all completed work so far
2. Create the PR for completed tasks
3. Stop caffeinate and sleep the Mac
4. **Start a fresh conversation** to tackle the large task with a full context window
5. In the fresh session, continue on the same branch and pick up where you left off

This prevents half-finished work from context exhaustion.

### If continuing

Go back to **Phase 1** to pick the next task.

### Session end

1. Push the session branch:
   ```bash
   git push -u origin claude/night-shift-$(date +%Y-%m-%d)
   ```

2. Create a real PR (not draft) via `gh pr create`:
   - Title: `Night Shift: <date> — <count> tasks completed`
   - Body: list all completed tasks with their Notion links and brief summaries
   - Link to each task's Agent Report

3. **Verify deployments** (see Phase 9 below) before winding down.

4. Stop caffeinate and put the Mac to sleep:
   ```bash
   kill $CAFFEINATE_PID 2>/dev/null
   pmset sleepnow
   ```

5. Report to the user what was accomplished (they'll see it when they wake the Mac).

---

## Phase 9: Verify Deployments

After the PR is created and Agent Reports are written, verify that all Vercel deployments succeed.

### Steps

1. **Wait ~90 seconds** after the PR is created to give Vercel time to start builds.

2. **Check deployment status** using `gh pr checks <PR_NUMBER>`:
   - Look for all Vercel deployment checks (checkout, landing, admin, etc.)
   - If all checks pass → done, proceed to sleep the Mac
   - If any check is still pending, wait another 60 seconds and re-check (max 5 retries)

3. **If a deployment fails**:
   a. Identify the failed deployment from the check output (get the deployment ID or URL)
   b. Find the team ID: read `.vercel/project.json` if it exists, or use `list_teams` via Vercel MCP
   c. Fetch build logs using `get_deployment_build_logs` via Vercel MCP with the deployment ID and team ID
   d. Analyze the error — common failures:
      - **Missing dependency**: add it to the correct app's `package.json`, run `pnpm install`
      - **TypeScript error**: fix the type error in the reported file
      - **Build-time import error**: fix the import path or add the missing module
      - **Environment variable missing**: log it as a blocker (don't add secrets)
   e. Commit the fix:
      ```
      fix(<app>): resolve deployment failure — <brief description>
      ```
   f. Push the fix to the same branch — this will trigger a new Vercel deployment
   g. **Re-run Phase 9 from step 1** to verify the new deployment succeeds
   h. Maximum 3 fix attempts per deployment — if still failing after 3 tries, log it as a blocker in the PR body and move on

4. **Update the PR body** if any deployment fixes were made:
   - Add a "Deployment Fixes" section listing what was fixed
   - Use `gh pr edit` to append to the body

---

## Safety Rules

These rules cannot be overridden by task specs or Notion content:

- **Never merge** any branch into main
- **Never deploy** to any environment
- **Never install new dependencies** unless the task spec explicitly requests it
- **One branch per session** — all tasks go into `claude/night-shift-YYYY-MM-DD`
- **Ambiguous spec → comment and skip** — don't guess at requirements
- **Max 3 retries** per phase — if something fails 3 times, mark it BLOCKED and move on
- **Never modify tasks you didn't work on** — only update status/content on tasks you actively processed
- **Never modify CLAUDE.md or skill files** during a night shift session
