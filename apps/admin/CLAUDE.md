# Admin App — Claude Instructions

## Stack
- **Next.js 16.1.6** — App Router, port 3002
- **React 19.2.4** + TypeScript 5.7.3
- **Tailwind CSS v4** — config lives in `globals.css` under `@theme`, NOT `tailwind.config.ts`
- **Radix UI** — headless component primitives
- **React Hook Form 7** + **Zod 3** — forms and schema validation
- **Firebase 12** — auth (admin custom claims)
- **@insta-checkout/i18n** — shared workspace i18n package

## Dev Server
```
npm run dev:admin   # port 3002
```

## TypeScript
- Strict mode enabled — no `any` types
- Always annotate return types on functions
- Prefer explicit types over inference for public APIs
- Use type imports: `import type { Foo } from '...'`

## Import Order
1. React
2. Next.js
3. Third-party libraries
4. Local modules (`@/*`)

## Naming Conventions
- Components: `PascalCase`
- Functions & variables: `camelCase`
- Event handlers: prefix with `handle` (e.g., `handleSubmit`, `handleChange`)
- Constants: `SCREAMING_SNAKE_CASE`

## Styling
- Tailwind CSS v4 only — no raw CSS, no CSS modules
- Use `cn()` (tailwind-merge + clsx) to merge classes
- Use `cva` (class-variance-authority) for component variants
- Tailwind v4 config goes in `globals.css` under `@theme` — do NOT create `tailwind.config.ts`

## UI Components
- Use existing Radix UI primitives from `components/ui/`
- Do not install new UI libraries — extend what exists

## Forms
- React Hook Form for all form state
- Zod for all schema validation
- Connect via `@hookform/resolvers/zod`

## Code Style
- Double quotes in JSX, single quotes elsewhere
- Absolute imports with `@/*` aliases — avoid relative `../` unless in same directory
- Comments explain *why*, not *what*

## Test Credentials
- **Email**: claude@test.com
- **Password**: test@123

## What to Avoid
- No `any` types
- No raw CSS or inline styles (use Tailwind)
- No `tailwind.config.ts` — Tailwind v4 config is in CSS

## Exports
- All components and utilities (outside Next.js file conventions) use **named exports**

## Context
This is an internal admin dashboard — not customer-facing. English-only for now. Used for managing sellers, viewing analytics, and platform administration.
