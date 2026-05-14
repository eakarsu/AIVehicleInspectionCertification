# Audit Recommendations & Status — AIVehicleInspectionCertification

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_08.md (section 23)

## Original audit recommendations

Missing AI counterparts:
- AI for damage assessment from photos (computer vision)
- Insurance estimate generation
- Predictive maintenance
- Maintenance cost prediction

Missing non-AI features:
- OEM recall database integration
- Parts supplier integration
- Third-party repair shop network
- Insurance claim integration

Custom feature ideas:
- Vision-based damage assessment
- Predictive maintenance flagging
- Parts price monitoring
- Repair shop network with quality ratings
- Insurance claim automation

## Implemented in this pass (MECHANICAL)

Added `server/routes/ai.js` and registered under `/api/ai` in `server/index.js`. Reuses existing `callOpenRouter` service and `aiRateLimiter` middleware. Persists results to `ai_results` via `persistAIResult`.

- `POST /api/ai/predictive-maintenance` — text-only predictive maintenance plan from vehicle metadata, mileage, age, condition score.
- `POST /api/ai/insurance-estimate` — text-only insurance repair-cost estimate generator from damage description.
- `POST /api/ai/recall-summary` — summarizes a recall record into severity + customer notification text.

## Backlog (priority order)

1. Vision-based damage assessment (`/api/ai/analyze-damage`) — needs `multer` + image preprocessing similar to `AIWarehouseManager` pattern; current `openrouter.js` is text-only and would need a vision-capable variant.
2. OEM recall database integration (NHTSA) — needs external API and credentials decision.
3. Parts price monitoring — needs supplier feeds.
4. Repair shop network — product/data decision.
5. Insurance claim automation (multi-step workflow + integration with insurer APIs).

## Apply pass 3 (frontend)

- **Status:** FE already wired — no changes.
- Three dedicated pages already exist and call the pass-2 endpoints:
  - `client/src/pages/AIPredictiveMaintenance.js` → `POST /api/ai/predictive-maintenance` (via `aiPredictiveMaintenance` in `services/api.js`)
  - `client/src/pages/AIInsuranceEstimate.js` → `POST /api/ai/insurance-estimate` (via `aiInsuranceEstimate`)
  - `client/src/pages/AIRecallSummary.js` → `POST /api/ai/recall-summary` (via `aiRecallSummary`)
- All three render markdown results and use the project's existing axios + JWT pattern.
- `App.js` registers `/ai/predictive-maintenance`, `/ai/insurance-estimate`, `/ai/recall-summary`.

## Apply pass 4 (mechanical backlog)

- **Status:** SKIPPED — no in-scope MECHANICAL items remain.
  - Vision-based damage assessment requires image upload + a vision-capable LLM helper (current `openrouter.js` is text-only); flagged TOO-RISKY for a no-`npm install` pass.
  - OEM recall (NHTSA), parts price feeds, repair-shop network, and insurance-claim automation all need credentials or product decisions.

## Apply pass 5 (all backlog)

Implemented 2 of 5 backlog rows. Vision-based damage assessment (TOO-RISKY — needs
multer + image-capable LLM helper) and insurance-claim automation (NEEDS-CREDS for
insurer APIs) remain out of scope.

- **BE:** `server/routes/ai.js` — 2 new routes mounted at `/api/ai`:
  - `POST /api/ai/nhtsa-recall-lookup` — was NEEDS-CREDS (OEM recall integration).
    Hits `api.nhtsa.gov` directly via stdlib `https` (the public endpoint is
    keyless; an optional `NHTSA_API_KEY` env can be set for higher quotas and is
    sent as `?api_key=` when present). The recall list is then summarised via the
    existing `callOpenRouter` helper. Returns 503 + `missing: OPENROUTER_API_KEY`
    if the AI key is absent or still set to the placeholder
    `your_openrouter_api_key_here`.
  - `POST /api/ai/parts-price-monitor` — was NEEDS-PRODUCT-DECISION (parts price
    monitoring). PRODUCT-DECISION: AI-based price-band advisory (low / median /
    high USD per part) — clearly labeled non-live. Cap 30 parts. Surfaces
    `supplier_feed_configured` (`PARTS_SUPPLIER_API_KEY`) for future feed
    integration. 503 + `missing: OPENROUTER_API_KEY` if key is missing /
    placeholder.

  Also strengthened the missing-key check across both new endpoints so the
  placeholder value `your_openrouter_api_key_here` is treated as unset (otherwise
  the request would fall through to OpenRouter, which returns a confusing
  "Missing Authentication header" error).

- **FE:** `client/src/pages/AINHTSARecallLookup.js` and
  `client/src/pages/AIPartsPriceMonitor.js` — match the existing `AIRecallSummary`
  pattern (Tailwind, react-toastify). `client/src/services/api.js` adds
  `aiNhtsaRecallLookup` and `aiPartsPriceMonitor`. `client/src/App.js` registers
  `/ai/nhtsa-recall-lookup` and `/ai/parts-price-monitor`.
  `client/src/components/Layout.js` adds two sidebar entries.

- **Syntax:** `node --check ai.js` PASS.

- **Smoke test:** BE on alt port :3093. Login `admin@autoinspect.com / password123`
  → 200 + JWT. POST `/api/ai/parts-price-monitor` → `503 {error, missing:
  "OPENROUTER_API_KEY"}` (correct, since `.env` carries the placeholder key).
  Endpoint reachable, gating works as designed.

### Remaining backlog
- Vision-based damage assessment (`/api/ai/analyze-damage`) — TOO-RISKY for an
  additive pass: needs `multer` + a vision-capable LLM helper (text-only
  `services/openrouter.js` would have to be extended).
- Insurance-claim automation — NEEDS-CREDS + multi-step workflow.
- Repair-shop network — NEEDS-PRODUCT-DECISION (data + matching policy).
