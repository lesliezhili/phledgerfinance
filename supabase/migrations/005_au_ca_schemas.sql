-- PHLedger Multi-Schema Migration
-- Australia (phledger_au): FY Jul 2026 – Jun 2027 (loading Jul-Dec 2026)
-- Canada (phledger_ca): FY Jan 2026 – Dec 2026

-- ═══════════════════════════════════════════════════════════════
-- Schema: phledger_au — Australian Financial Year (Jul-Jun)
-- ═══════════════════════════════════════════════════════════════
CREATE SCHEMA IF NOT EXISTS phledger_au;

CREATE TABLE IF NOT EXISTS phledger_au.transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AUD' CHECK (currency = 'AUD'),
  bank TEXT NOT NULL DEFAULT 'anz',
  account_code TEXT,
  coa_code TEXT,
  coa_name TEXT,
  tax_code TEXT,
  gst_amount NUMERIC(10,2),
  category TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_au.ledger_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT REFERENCES phledger_au.transactions(id),
  date DATE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT,
  debit NUMERIC(12,2) DEFAULT 0,
  credit NUMERIC(12,2) DEFAULT 0,
  narration TEXT,
  tax_code TEXT,
  bas_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_au.bas_return (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fy TEXT NOT NULL,
  quarter INT CHECK (quarter BETWEEN 1 AND 4),
  period_start DATE,
  period_end DATE,
  g1_total_sales NUMERIC(12,2),
  g11_capital_purchases NUMERIC(12,2),
  label_1a_gst_collected NUMERIC(12,2),
  label_1b_gst_paid NUMERIC(12,2),
  label_9_net_gst NUMERIC(12,2),
  w1_total_salary_wages NUMERIC(12,2),
  w2_amount_withheld NUMERIC(12,2),
  t1_instalment_income NUMERIC(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','lodged','amended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_au.tax_config (
  id SERIAL PRIMARY KEY,
  fy TEXT NOT NULL,
  gst_rate NUMERIC(4,2) DEFAULT 0.10,
  company_tax_rate NUMERIC(4,2) DEFAULT 0.25,
  super_rate NUMERIC(5,3) DEFAULT 0.115,
  payroll_tax_threshold NUMERIC(12,2) DEFAULT 1000000,
  bas_frequency TEXT DEFAULT 'quarterly',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for AU
CREATE INDEX IF NOT EXISTS idx_au_tx_date ON phledger_au.transactions(date);
CREATE INDEX IF NOT EXISTS idx_au_tx_bank ON phledger_au.transactions(bank);
CREATE INDEX IF NOT EXISTS idx_au_journal_date ON phledger_au.ledger_journal(date);
CREATE INDEX IF NOT EXISTS idx_au_journal_acct ON phledger_au.ledger_journal(account_code);

-- ═══════════════════════════════════════════════════════════════
-- Schema: phledger_ca — Canadian Financial Year (Jan-Dec)
-- ═══════════════════════════════════════════════════════════════
CREATE SCHEMA IF NOT EXISTS phledger_ca;

CREATE TABLE IF NOT EXISTS phledger_ca.transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'CAD' CHECK (currency = 'CAD'),
  bank TEXT NOT NULL DEFAULT 'rbc',
  account_code TEXT,
  coa_code TEXT,
  coa_name TEXT,
  tax_code TEXT,
  hst_amount NUMERIC(10,2),
  pst_amount NUMERIC(10,2),
  category TEXT,
  province TEXT DEFAULT 'ON',
  is_reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_ca.ledger_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT REFERENCES phledger_ca.transactions(id),
  date DATE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT,
  debit NUMERIC(12,2) DEFAULT 0,
  credit NUMERIC(12,2) DEFAULT 0,
  narration TEXT,
  tax_code TEXT,
  cca_class INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_ca.gst_hst_return (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fy TEXT NOT NULL,
  quarter INT CHECK (quarter BETWEEN 1 AND 4),
  period_start DATE,
  period_end DATE,
  line_101_sales NUMERIC(12,2),
  line_105_gst_hst_collected NUMERIC(12,2),
  line_106_itc_claimed NUMERIC(12,2),
  line_109_net_tax NUMERIC(12,2),
  line_110_instalments NUMERIC(12,2),
  line_113_balance NUMERIC(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','filed','amended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phledger_ca.tax_config (
  id SERIAL PRIMARY KEY,
  fy TEXT NOT NULL,
  gst_rate NUMERIC(4,2) DEFAULT 0.05,
  hst_rate NUMERIC(4,2) DEFAULT 0.13,
  corporate_rate NUMERIC(4,2) DEFAULT 0.15,
  sbd_rate NUMERIC(4,2) DEFAULT 0.09,
  sbd_limit NUMERIC(12,2) DEFAULT 500000,
  cpp_rate NUMERIC(5,3) DEFAULT 0.0595,
  ei_rate NUMERIC(5,3) DEFAULT 0.0163,
  province TEXT DEFAULT 'ON',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for CA
CREATE INDEX IF NOT EXISTS idx_ca_tx_date ON phledger_ca.transactions(date);
CREATE INDEX IF NOT EXISTS idx_ca_tx_bank ON phledger_ca.transactions(bank);
CREATE INDEX IF NOT EXISTS idx_ca_journal_date ON phledger_ca.ledger_journal(date);
CREATE INDEX IF NOT EXISTS idx_ca_journal_acct ON phledger_ca.ledger_journal(account_code);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies (open for now — tighten with auth later)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE phledger_au.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phledger_au.ledger_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE phledger_au.bas_return ENABLE ROW LEVEL SECURITY;
ALTER TABLE phledger_ca.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phledger_ca.ledger_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE phledger_ca.gst_hst_return ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all_au_tx ON phledger_au.transactions FOR ALL USING (true);
CREATE POLICY allow_all_au_journal ON phledger_au.ledger_journal FOR ALL USING (true);
CREATE POLICY allow_all_au_bas ON phledger_au.bas_return FOR ALL USING (true);
CREATE POLICY allow_all_ca_tx ON phledger_ca.transactions FOR ALL USING (true);
CREATE POLICY allow_all_ca_journal ON phledger_ca.ledger_journal FOR ALL USING (true);
CREATE POLICY allow_all_ca_gst ON phledger_ca.gst_hst_return FOR ALL USING (true);

-- Grant access to anon and authenticated roles
GRANT USAGE ON SCHEMA phledger_au TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA phledger_au TO anon, authenticated;
GRANT USAGE ON SCHEMA phledger_ca TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA phledger_ca TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA phledger_au TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA phledger_ca TO anon, authenticated;

-- Seed AU tax config (FY2026-27)
INSERT INTO phledger_au.tax_config (fy, gst_rate, company_tax_rate, super_rate, bas_frequency)
VALUES ('2026-27', 0.10, 0.25, 0.115, 'quarterly')
ON CONFLICT DO NOTHING;

-- Seed CA tax config (FY2026)
INSERT INTO phledger_ca.tax_config (fy, gst_rate, hst_rate, corporate_rate, sbd_rate, sbd_limit, cpp_rate, ei_rate, province)
VALUES ('2026', 0.05, 0.13, 0.15, 0.09, 500000, 0.0595, 0.0163, 'ON')
ON CONFLICT DO NOTHING;
