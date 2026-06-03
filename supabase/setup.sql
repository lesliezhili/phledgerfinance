-- ═══════════════════════════════════════════════════════════
-- PHLedger Supabase Setup — Run in SQL Editor
-- https://supabase.com/dashboard/project/dtfbcvefttirngkjuqvl/sql
-- ═══════════════════════════════════════════════════════════

-- Australia transactions (FY Jul 2026 - Jun 2027)
CREATE TABLE IF NOT EXISTS au_transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  bank TEXT DEFAULT 'anz',
  account_code TEXT,
  coa_code TEXT,
  coa_name TEXT,
  tax_code TEXT,
  gst_amount NUMERIC(10,2),
  category TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Canada transactions (FY Jan - Dec 2026)
CREATE TABLE IF NOT EXISTS ca_transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  bank TEXT DEFAULT 'rbc',
  account_code TEXT,
  coa_code TEXT,
  coa_name TEXT,
  tax_code TEXT,
  hst_amount NUMERIC(10,2),
  category TEXT,
  province TEXT DEFAULT 'ON',
  is_reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AU BAS returns
CREATE TABLE IF NOT EXISTS au_bas_return (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fy TEXT NOT NULL,
  quarter INT,
  period_start DATE,
  period_end DATE,
  g1_total_sales NUMERIC(12,2),
  label_1a_gst_collected NUMERIC(12,2),
  label_1b_gst_paid NUMERIC(12,2),
  label_9_net_gst NUMERIC(12,2),
  w1_wages NUMERIC(12,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CA GST/HST returns
CREATE TABLE IF NOT EXISTS ca_gst_hst_return (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fy TEXT NOT NULL,
  quarter INT,
  period_start DATE,
  period_end DATE,
  line_101_sales NUMERIC(12,2),
  line_105_gst_collected NUMERIC(12,2),
  line_106_itc_claimed NUMERIC(12,2),
  line_109_net_tax NUMERIC(12,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Double-entry journal
CREATE TABLE IF NOT EXISTS ledger_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL CHECK (country IN ('AU','CA')),
  transaction_id TEXT,
  date DATE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT,
  debit NUMERIC(12,2) DEFAULT 0,
  credit NUMERIC(12,2) DEFAULT 0,
  narration TEXT,
  tax_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tax config
CREATE TABLE IF NOT EXISTS tax_config (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL CHECK (country IN ('AU','CA')),
  fy TEXT NOT NULL,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_au_tx_date ON au_transactions(date);
CREATE INDEX IF NOT EXISTS idx_au_tx_bank ON au_transactions(bank);
CREATE INDEX IF NOT EXISTS idx_ca_tx_date ON ca_transactions(date);
CREATE INDEX IF NOT EXISTS idx_ca_tx_bank ON ca_transactions(bank);
CREATE INDEX IF NOT EXISTS idx_journal_country ON ledger_journal(country);
CREATE INDEX IF NOT EXISTS idx_journal_date ON ledger_journal(date);

-- RLS (open for now)
ALTER TABLE au_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE au_bas_return ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_gst_hst_return ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all_au ON au_transactions FOR ALL USING (true);
CREATE POLICY allow_all_ca ON ca_transactions FOR ALL USING (true);
CREATE POLICY allow_all_bas ON au_bas_return FOR ALL USING (true);
CREATE POLICY allow_all_gst ON ca_gst_hst_return FOR ALL USING (true);
CREATE POLICY allow_all_journal ON ledger_journal FOR ALL USING (true);
CREATE POLICY allow_all_config ON tax_config FOR ALL USING (true);

-- Seed tax config
INSERT INTO tax_config (country, fy, config) VALUES
  ('AU', '2026-27', '{"gst_rate":0.10,"company_tax":0.25,"super_rate":0.115,"bas":"quarterly","fy_start":"2026-07-01","fy_end":"2027-06-30"}'::jsonb),
  ('CA', '2026', '{"gst_rate":0.05,"hst_rate":0.13,"corporate_rate":0.15,"sbd_rate":0.09,"sbd_limit":500000,"cpp":0.0595,"ei":0.0163,"fy_start":"2026-01-01","fy_end":"2026-12-31"}'::jsonb)
ON CONFLICT DO NOTHING;
