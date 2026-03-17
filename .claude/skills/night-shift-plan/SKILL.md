---
name: night-shift-plan
description: "Plan a Night Shift session by analyzing all Groomed tasks from Notion, estimating scope, and grouping them into parallel sessions. Use this before running /night-shift to know how many conversations to start and which tasks go in each. Trigger when the user says 'plan night shift', 'night shift plan', '/night-shift-plan', or wants to know how to split tasks across sessions."
---

# Night Shift Plan — Session Planner

Analyze the Groomed task board and output a session plan that the user can use to start parallel `/night-shift` conversations.

---

## Step 1: Fetch all Groomed tasks

Query the Development Launch Board for tasks where `Task status` = "✅ Groomed".

Use `notion-query-database-view` with view ID:
```
view://f8ad4f5b-1e21-42b8-bf8f-600cd4cb1912
```

Also check for tasks with comments (these are comment-driven fixes from previous sessions — they are quick and should be grouped with related tasks).

---

## Step 2: Estimate scope for each task

For each Groomed task, fetch the full Notion page and estimate:

| Factor | How to assess |
|--------|--------------|
| **Files** | Count implementation steps, new files mentioned in spec |
| **Apps touched** | Check the `Category` property (Backend, Landing App, Checkout App, Admin Dashboard) |
| **Context weight** | Light (1-3 files, 1 app), Medium (4-8 files, 1-2 apps), Heavy (8+ files, 2+ apps) |
| **Has comments?** | If yes, it's a comment-driven fix (very light — just adjustments) |
| **Dependencies** | Does this task depend on another task's changes? (e.g., admin dashboard tasks need #72 first) |

Classify each task:
- **Comment fix**: Has user comments, previously implemented — just needs adjustments
- **Small**: 1-3 files, 1 app, straightforward
- **Medium**: 4-8 files, 1-2 apps, new component or endpoint
- **Large**: 8+ files, 2+ apps, new collections/schemas, scaffolding

---

## Step 3: Group tasks into sessions

### Grouping rules

1. **App affinity**: Tasks touching the same apps share context efficiently (reading CLAUDE.md, understanding patterns, dev server setup)
2. **Size budgeting**: Each session can handle roughly:
   - 3-5 small tasks, OR
   - 2-3 medium tasks, OR
   - 1 large task + 1-2 small tasks
   - Comment fixes are "free" — attach them to whatever session touches the same app
3. **Dependency ordering**: If task B depends on task A (e.g., admin features depend on admin setup), they go in the same session with A first
4. **No file conflicts**: Tasks in different sessions should NOT modify the same files. If two tasks both modify `DashboardHomeContent.tsx`, they must be in the same session
5. **Large tasks get their own session** if they would consume >60% of a session's context alone

### Branch naming

Each session gets its own branch:
```
claude/night-shift-YYYY-MM-DD-s1
claude/night-shift-YYYY-MM-DD-s2
claude/night-shift-YYYY-MM-DD-s3
```

Each session creates its own PR when done.

---

## Step 4: Output the plan

Present the plan in this format:

```markdown
## Night Shift Plan — {date}

**{N} Groomed tasks → {M} sessions**

---

### Session 1: {theme} ({weight})
**Branch:** `claude/night-shift-YYYY-MM-DD-s1`
**Apps:** {list of apps}
**Estimated tasks:** {count}

| # | Task | Size | Notes |
|---|------|------|-------|
| DLB-XX | Task title | Small | Comment fix |
| DLB-XX | Task title | Medium | New component |

---

### Session 2: {theme} ({weight})
...

---

### How to run

Start {M} Claude Code conversations. In each one, paste:

> /night-shift
> Session tasks: #XX, #YY, #ZZ
> Branch: claude/night-shift-YYYY-MM-DD-sN

Each session will create its own PR when done.
```

---

## Step 5: Confirm with the user

After presenting the plan, ask:
> Does this grouping look right? Want me to adjust anything before you start the sessions?

The user may want to:
- Move a task between sessions
- Combine or split sessions
- Prioritize certain tasks
- Skip certain tasks entirely

Adjust the plan based on feedback, then the user starts the conversations.
