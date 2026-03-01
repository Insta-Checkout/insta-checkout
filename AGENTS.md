## Cursor Cloud specific instructions

### Project overview
InstaCheckout — a pnpm monorepo with three apps under `apps/`:
- **landing** (Next.js, port 3000): Marketing page + seller onboarding form at `/onboard`
- **checkout** (Next.js, port 3001): Buyer-facing 3-step payment flow
- **backend** (Express, port 4000): REST API with MongoDB/Mongoose

### Running services
- `pnpm --filter landing dev` — landing page on port 3000
- `pnpm --filter checkout dev` — checkout page on port 3001
- `MONGODB_URI=mongodb://localhost:27017/instacheckout node apps/backend/server.js` — backend on port 4000 (requires MongoDB running)

### Key caveats
- **ESLint is not installed** — the `lint` scripts in both frontend apps reference `eslint .` but eslint is not in devDependencies and no eslint config exists.
- **MongoDB required for backend** — start with `sudo mongod --dbpath /data/db --fork --logpath /var/log/mongod.log`. Seed data: `MONGODB_URI=mongodb://localhost:27017/instacheckout node apps/backend/scripts/seed.js`.
- **WhatsApp integration is stubbed** — `services/whatsapp.js` logs to console instead of sending real messages.
- **Phone number format** — frontend collects Egyptian local format (`01XXXXXXXXX`), strips leading `0` and prepends `20` before sending to backend (which expects `^20[0-9]{10}$`).
- Both `pnpm-lock.yaml` and `package-lock.json` exist; use **pnpm** (matches `pnpm-workspace.yaml`).
