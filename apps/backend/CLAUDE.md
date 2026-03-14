# Backend App — Claude Instructions

## Stack
- **Express.js 4** — REST API, port 4000
- **TypeScript 5.7** — strict mode enabled
- **MongoDB** — native driver (no ORM/ODM), singleton connection via `db.ts`
- **Firebase Admin SDK** — token-based authentication
- **Multer** — file uploads (memory storage, 10MB limit)
- **Nodemon + tsx** — development hot reload

## Dev Server
```
npm run dev   # port 4000
```

## Project Structure
```
src/
├── index.ts          # Express app setup, middleware, route mounting
├── db.ts             # MongoDB singleton connection
├── middleware/        # Auth and request middleware
├── routes/           # Route handlers (one file per resource)
├── services/         # Business logic and external integrations
```

## TypeScript
- Strict mode enabled — no `any` types
- Use `async/await` exclusively — no callbacks, no raw `.then()` chains
- Type request bodies as `Record<string, unknown>` and validate before use
- Use type imports: `import type { Foo } from '...'`

## Route Conventions
- One file per resource (e.g., `sellers.ts`, `checkout.ts`)
- Use `express.Router()` — mount in `index.ts`
- Keep route handlers thin — move complex logic to `services/`
- Protected routes use `requireFirebaseAuth` middleware
- Public routes (checkout, webhooks, health) skip auth

## Validation
- Validate all input at the API boundary before any business logic
- Return field-level errors as `{ field, message }` arrays
- Trim and normalize strings (e.g., phone numbers → `20XXXXXXXXXX` format)
- Use `new URL()` for URL validation
- Never trust client input — validate types, lengths, and formats

## Error Handling
- Wrap route handlers in `try/catch`
- Return consistent error responses: `{ error: string, message: string, details?: any }`
- Map MongoDB duplicate key errors (code `11000`) to `409 Conflict`
- Never leak stack traces or internal details in production responses
- Use correct HTTP status codes: `400` validation, `401` auth, `404` not found, `409` conflict, `500` server error

## Response Format
- Always return JSON
- Success responses include relevant data directly
- Error responses include `error` code and human-readable `message`
- Pagination responses include `total`, `page`, `limit`, and `data` array

## Logging
- Use `console.log` with context prefix: `[POST /sellers]`, `[db]`, `[Firebase Auth]`
- Log request context (method, path) on errors
- Never log sensitive data (tokens, passwords, full request bodies in production)

## Security
- Firebase token verification on all seller routes
- CORS configured with explicit allowed origins — no wildcards in production
- File uploads validated by type and size via Multer config
- Environment secrets loaded from `.env` — never hardcode credentials
- Sanitize user input before MongoDB queries to prevent injection

## MongoDB Patterns
- Access collections via `db.collection("name")` — no model abstractions
- Use `findOneAndUpdate` with `returnDocument: 'after'` for atomic updates
- Prefer `updateOne`/`insertOne` over bulk operations for single documents
- Use aggregation pipelines for complex queries (analytics, joins)
- Always scope seller queries by `firebaseUid` to prevent cross-tenant access
- Soft-delete with `archived: true` — never hard-delete user data

## Naming Conventions
- Files: `camelCase.ts` (e.g., `sellersProducts.ts`)
- Functions & variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Route paths: kebab-case (e.g., `/payment-links`)

## API Documentation Sync
- **Every endpoint change must be reflected in the [API Documentation Notion page](https://www.notion.so/karimtamer/API-Documentation-1cc606c6eb024bffa94633079f005478?t=323c92f98d9c804aa65200a9fc7b8c52)**
- This includes: adding new endpoints, editing existing endpoints (path, method, request/response body, auth requirements), and deleting endpoints
- After any route modification, update the Notion page using the Notion MCP tools before marking the task as complete
- Do not skip this step — the Notion page is the single source of truth for API consumers

## What to Avoid
- No `any` types
- No synchronous blocking operations
- No raw `require()` — use ES module `import`
- No business logic in route handlers — delegate to services
- No hardcoded configuration values — use environment variables
