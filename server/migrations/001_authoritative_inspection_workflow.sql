BEGIN;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE TABLE IF NOT EXISTS inspection_workflows (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, vin TEXT NOT NULL,
 odometer BIGINT NOT NULL CHECK(odometer>=0), status TEXT NOT NULL DEFAULT 'intake', version INTEGER NOT NULL DEFAULT 1,
 submitter_id TEXT NOT NULL, inspector_id TEXT, owner_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,idempotency_key), UNIQUE(tenant_id,id));
CREATE TABLE IF NOT EXISTS inspection_evidence (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, workflow_id UUID NOT NULL, evidence_type TEXT NOT NULL, uri TEXT NOT NULL,
 checksum TEXT NOT NULL, observed_at TIMESTAMPTZ NOT NULL, consent_reference TEXT NOT NULL, findings JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,workflow_id,checksum));
CREATE TABLE IF NOT EXISTS inspection_deliveries (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, workflow_id UUID NOT NULL, provider_type TEXT NOT NULL, idempotency_key TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','acknowledged','retrying','dead_letter')), attempt_count INTEGER NOT NULL DEFAULT 0,
 next_attempt_at TIMESTAMPTZ, receipt JSONB, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,provider_type,idempotency_key));
CREATE TABLE IF NOT EXISTS inspection_evaluations (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, workflow_id UUID, fixture_key TEXT NOT NULL, expected_outcome JSONB NOT NULL,
 actual_outcome JSONB, latency_ms INTEGER, failure_mode TEXT, edge_case TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,fixture_key));
CREATE TABLE IF NOT EXISTS inspection_workflow_audit (id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, workflow_id UUID NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, from_status TEXT, to_status TEXT, record_version INTEGER NOT NULL, evidence JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE OR REPLACE FUNCTION reject_inspection_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'inspection audit is append-only'; END $$;
DROP TRIGGER IF EXISTS inspection_audit_append_only ON inspection_workflow_audit;
CREATE TRIGGER inspection_audit_append_only BEFORE UPDATE OR DELETE ON inspection_workflow_audit FOR EACH ROW EXECUTE FUNCTION reject_inspection_audit_mutation();
COMMIT;
