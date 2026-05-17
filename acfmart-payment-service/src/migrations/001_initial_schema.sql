-- ─────────────────────────────────────────────────────────────────────────
--  ACFMart Payment Service - Initial Schema
--  Phiên bản: 1.0.0
--  Áp dụng: PostgreSQL 14+
--
--  Quy ước:
--   - UUID v4 cho primary key (gen_random_uuid từ pgcrypto)
--   - DECIMAL(15,2) cho tiền VND (đủ chứa 999 nghìn tỷ - quá đủ marketplace VN)
--   - JSONB cho metadata để query được, không dùng JSON text
--   - Soft FK qua VARCHAR(64) - giữ khả năng partition khi scale lớn
-- ─────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── transactions: bảng chính lưu mọi giao dịch ─────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id       VARCHAR(64) UNIQUE NOT NULL,
  order_id             VARCHAR(64) NOT NULL,
  seller_id            VARCHAR(64),
  buyer_id             VARCHAR(64),
  amount               DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency             VARCHAR(3) NOT NULL DEFAULT 'VND',
  payment_method       VARCHAR(32) NOT NULL,
  provider             VARCHAR(32) NOT NULL,
  status               VARCHAR(32) NOT NULL,
  provider_tx_id       VARCHAR(128),
  buyer_phone          VARCHAR(20),
  buyer_email          VARCHAR(255),
  redirect_url         TEXT,
  payment_url          TEXT,
  expires_at           TIMESTAMPTZ,
  released_at          TIMESTAMPTZ,
  refunded_at          TIMESTAMPTZ,
  idempotency_key      VARCHAR(128),
  webhook_signature    TEXT,
  error_code           VARCHAR(64),
  error_message        TEXT,
  metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_order_id      ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_tx_seller_id     ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_tx_status        ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_provider      ON transactions(provider);
CREATE INDEX IF NOT EXISTS idx_tx_provider_txid ON transactions(provider_tx_id);
CREATE INDEX IF NOT EXISTS idx_tx_idem_key      ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tx_created_at    ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_expires_at    ON transactions(expires_at) WHERE status = 'HELD';

-- ─── escrow_ledger: sổ cái giữ tiền (append-only) ───────────────────────
CREATE TABLE IF NOT EXISTS escrow_ledger (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id       VARCHAR(64) NOT NULL REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
  seller_id            VARCHAR(64),
  action               VARCHAR(20) NOT NULL CHECK (action IN ('hold', 'release', 'refund', 'adjust', 'fee')),
  amount               DECIMAL(15,2) NOT NULL,
  balance_before       DECIMAL(15,2) NOT NULL,
  balance_after        DECIMAL(15,2) NOT NULL,
  released_at          TIMESTAMPTZ,
  notes                TEXT,
  metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_tx_id     ON escrow_ledger(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller    ON escrow_ledger(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_action    ON escrow_ledger(action);
CREATE INDEX IF NOT EXISTS idx_escrow_created   ON escrow_ledger(created_at DESC);

-- ─── payout_requests: yêu cầu rút tiền của seller ──────────────────────
CREATE TABLE IF NOT EXISTS payout_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id            VARCHAR(64) UNIQUE NOT NULL,
  seller_id            VARCHAR(64) NOT NULL,
  amount               DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency             VARCHAR(3) NOT NULL DEFAULT 'VND',
  status               VARCHAR(32) NOT NULL DEFAULT 'pending',
  bank_name            VARCHAR(128) NOT NULL,
  bank_account_number  VARCHAR(64) NOT NULL,
  bank_account_holder  VARCHAR(128) NOT NULL,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at          TIMESTAMPTZ,
  approved_by          VARCHAR(64),
  paid_at              TIMESTAMPTZ,
  rejected_at          TIMESTAMPTZ,
  rejected_reason      TEXT,
  transaction_ref      VARCHAR(128),
  metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_seller_id ON payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_status    ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requested ON payout_requests(requested_at DESC);

-- ─── webhook_logs: lưu raw payload mọi webhook nhận được ───────────────
CREATE TABLE IF NOT EXISTS webhook_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider             VARCHAR(32) NOT NULL,
  transaction_id       VARCHAR(64),
  event_type           VARCHAR(64),
  signature            TEXT,
  signature_valid      BOOLEAN NOT NULL DEFAULT FALSE,
  status               VARCHAR(32),
  http_status          INTEGER,
  remote_ip            VARCHAR(64),
  headers              JSONB,
  payload              JSONB NOT NULL,
  processed            BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at         TIMESTAMPTZ,
  error_message        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_provider     ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_tx_id        ON webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_processed    ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_created      ON webhook_logs(created_at DESC);

-- ─── idempotency_keys: chống trùng lặp request ─────────────────────────
-- Mỗi request POST từ client kèm header `Idempotency-Key`. Server lưu key
-- + response để retry an toàn. TTL 24h - không lưu mãi mãi.
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key                  VARCHAR(128) PRIMARY KEY,
  request_hash         VARCHAR(64) NOT NULL,
  response_status      INTEGER,
  response_body        JSONB,
  transaction_id       VARCHAR(64),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idem_expires_at      ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idem_transaction_id  ON idempotency_keys(transaction_id) WHERE transaction_id IS NOT NULL;

-- ─── audit_log: trail mọi thay đổi nhạy cảm ────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name           VARCHAR(64) NOT NULL,
  record_id            VARCHAR(64) NOT NULL,
  action               VARCHAR(16) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values           JSONB,
  new_values           JSONB,
  changed_by           VARCHAR(128),
  source_ip            VARCHAR(64),
  changed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at   ON audit_log(changed_at DESC);

-- ─── Trigger updated_at tự động ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tx_updated_at ON transactions;
CREATE TRIGGER trg_tx_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payout_updated_at ON payout_requests;
CREATE TRIGGER trg_payout_updated_at
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Trigger audit log cho transactions ────────────────────────────────
CREATE OR REPLACE FUNCTION audit_transactions() RETURNS TRIGGER AS $$
DECLARE
  old_json JSONB;
  new_json JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_json := to_jsonb(OLD) - ARRAY['created_at', 'updated_at'];
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('transactions', OLD.transaction_id, 'DELETE', old_json, NULL, current_user);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    new_json := to_jsonb(NEW) - ARRAY['created_at', 'updated_at'];
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('transactions', NEW.transaction_id, 'INSERT', NULL, new_json, current_user);
    RETURN NEW;
  ELSE
    old_json := to_jsonb(OLD) - ARRAY['created_at', 'updated_at'];
    new_json := to_jsonb(NEW) - ARRAY['created_at', 'updated_at'];
    IF old_json <> new_json THEN
      INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
      VALUES ('transactions', NEW.transaction_id, 'UPDATE', old_json, new_json, current_user);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_transactions ON transactions;
CREATE TRIGGER trg_audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_transactions();

-- ─── Comment tài liệu ──────────────────────────────────────────────────
COMMENT ON TABLE  transactions       IS 'Mọi giao dịch thanh toán (escrow + non-escrow)';
COMMENT ON TABLE  escrow_ledger      IS 'Sổ cái giữ tiền - append-only, dùng cho audit';
COMMENT ON TABLE  payout_requests    IS 'Yêu cầu rút tiền của seller';
COMMENT ON TABLE  webhook_logs       IS 'Log raw payload mọi webhook PSP/3PL';
COMMENT ON TABLE  idempotency_keys   IS 'Khoá chống trùng lặp request - TTL 24h';
COMMENT ON TABLE  audit_log          IS 'Audit trail cho compliance và forensics';
