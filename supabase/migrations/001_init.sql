-- PHLedger Supabase Schema — Migration 001
-- Run via Supabase Dashboard > SQL Editor, or: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id            TEXT          PRIMARY KEY,
  date          DATE          NOT NULL,
  description   TEXT          NOT NULL,
  amount        DECIMAL(18,4) NOT NULL,
  currency      TEXT          NOT NULL CHECK (currency IN ('AUD','CAD')),
  bank          TEXT,
  account_code  TEXT,
  tax_code      TEXT,
  category      TEXT,
  uploaded_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_date      ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_bank      ON transactions (bank);
CREATE INDEX IF NOT EXISTS idx_tx_currency  ON transactions (currency);
CREATE INDEX IF NOT EXISTS idx_tx_category  ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_tx_bank_date ON transactions (bank, date DESC);

-- ── migration_log ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS migration_log (
  id                  BIGSERIAL    PRIMARY KEY,
  run_at              TIMESTAMPTZ  DEFAULT NOW(),
  total_transactions  INT,
  banks_included      TEXT[],
  notes               TEXT
);

-- ── Row Level Security (enable for production) ───────────
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for service role"
--   ON transactions FOR ALL USING (true);

-- ── Helper view: monthly summary ─────────────────────────
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  DATE_TRUNC('month', date)     AS month,
  currency,
  bank,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)   AS income,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS expenses,
  SUM(amount)                    AS net,
  COUNT(*)                       AS tx_count
FROM transactions
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

-- ── Helper view: category summary ────────────────────────
CREATE OR REPLACE VIEW v_category_summary AS
SELECT
  category,
  account_code,
  currency,
  SUM(amount) AS total,
  COUNT(*)    AS tx_count
FROM transactions
WHERE category IS NOT NULL
GROUP BY 1, 2, 3
ORDER BY ABS(SUM(amount)) DESC;
