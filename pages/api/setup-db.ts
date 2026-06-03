// pages/api/setup-db.ts — Creates phledger_au + phledger_ca tables in Supabase
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dtfbcvefttirngkjuqvl.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!SERVICE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set' });

  const client = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'public' } });

  // Create tables in public schema with prefixes for AU and CA
  const sql = `
    -- PHLedger Australia transactions (FY Jul 2026 - Jun 2027)
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

    -- PHLedger Canada transactions (FY Jan - Dec 2026)
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

    -- Ledger journal (double-entry)
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
  `;

  // Execute via RPC (need to have exec_sql function, or use direct insert approach)
  // Since we can't run DDL via PostgREST, return the SQL for manual execution
  // BUT we can create tables by inserting to a migrations tracker

  res.json({
    success: true,
    message: 'Run this SQL in Supabase Dashboard > SQL Editor',
    supabase_url: SUPABASE_URL,
    dashboard: 'https://supabase.com/dashboard/project/dtfbcvefttirngkjuqvl/sql',
    sql: sql.trim(),
  });
}
