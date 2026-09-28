# Claim Audit App (demo)

Source of truth: `master-plan.md`. Progress: `progress-log.md`.

```bash
npm install
npm run dev     # re-seeds data/claims.db, then starts Next.js on http://localhost:3000
npm run seed    # re-seed only
```

All org data, limits and hours are MOCK placeholders (`config/rules.config.draft.json`).
Planted problem answer key: `tests/fixtures/seed-expected.json`.
