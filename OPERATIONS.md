# Operations

Copy `.env.example` to `.env`, replace placeholders, provision PostgreSQL/dependencies and the `server/uploads` directory with least privilege, then run `cd server && npm run migrate`. Start with `./start.sh`.

Startup is non-mutating and fails closed on missing secrets/schema. Run `npm test` in `server`. OEM recall and delivery records are typed receipts, not proof of a live OEM connection. Certification requires an independent human inspector; this software does not itself provide legal, safety, insurer, or regulatory certification. Back up workflow/audit data and test recovery before deployment.

The legacy force-sync seed is destructive and guarded by `ALLOW_DESTRUCTIVE_DEMO_SEED=true`; use it only for an isolated disposable database.
