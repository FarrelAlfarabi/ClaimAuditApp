# Claim Audit App (demo)

Source of truth: `master-plan.md`. Progress: `progress-log.md`.

```bash
cp .env.example .env.local   # then set DEMO_PASSWORD (ask Farrel); AUTH_DISABLED=1 turns login off
npm install
npm run dev     # re-seeds data/claims.db, then starts Next.js on http://localhost:3000
npm run seed    # re-seed only (wipes demo data)
npm run demo    # production build + start, reachable from a phone on the same network
npm test        # rules engine tests
```

All org data, limits and hours are MOCK placeholders (`config/rules.config.json`).
Planted problem answer key: `tests/fixtures/seed-expected.json`.
