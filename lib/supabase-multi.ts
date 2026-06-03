// lib/supabase-multi.ts — Multi-schema Supabase client for AU/CA
// PHLedger Australia: schema 'phledger_au' (FY Jul 2026 – Jun 2027)
// PHLedger Canada:   schema 'phledger_ca' (FY Jan 2026 – Dec 2026)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dtfbcvefttirngkjuqvl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export type Country = 'AU' | 'CA';

const SCHEMA_MAP: Record<Country, string> = {
  AU: 'phledger_au',
  CA: 'phledger_ca',
};

const FY_RANGE: Record<Country, { start: string; end: string; label: string }> = {
  AU: { start: '2026-07-01', end: '2027-06-30', label: 'FY2026-27 (Jul 2026 – Jun 2027)' },
  CA: { start: '2026-01-01', end: '2026-12-31', label: 'FY2026 (Jan – Dec 2026)' },
};

const clients: Record<string, SupabaseClient> = {};

export function getClient(country: Country): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const schema = SCHEMA_MAP[country];
  if (!clients[schema]) {
    clients[schema] = createClient(SUPABASE_URL, SUPABASE_KEY, {
      db: { schema },
      auth: { persistSession: false },
    });
  }
  return clients[schema];
}

export function getSchema(country: Country): string {
  return SCHEMA_MAP[country];
}

export function getFYRange(country: Country) {
  return FY_RANGE[country];
}

// ─── Transaction Operations ───────────────────────────────────

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  bank: string;
  account_code?: string;
  coa_code?: string;
  coa_name?: string;
  tax_code?: string;
  gst_amount?: number;
  hst_amount?: number;
  pst_amount?: number;
  category?: string;
  province?: string;
  is_reconciled?: boolean;
}

const BATCH = 500;

export async function loadTransactions(country: Country, txs: BankTransaction[]): Promise<number> {
  const client = getClient(country);
  if (!client) return 0;
  let loaded = 0;
  for (let i = 0; i < txs.length; i += BATCH) {
    const batch = txs.slice(i, i + BATCH);
    const { error } = await client.from('transactions').upsert(batch);
    if (error) console.error(`Load error (${country}):`, error.message);
    else loaded += batch.length;
  }
  return loaded;
}

export async function getTransactions(country: Country, opts: {
  bank?: string;
  from?: string;
  to?: string;
  limit?: number;
} = {}): Promise<BankTransaction[]> {
  const client = getClient(country);
  if (!client) return [];
  const fy = FY_RANGE[country];
  let query = client.from('transactions').select('*');
  if (opts.bank) query = query.eq('bank', opts.bank);
  const from = opts.from || fy.start;
  const to = opts.to || fy.end;
  query = query.gte('date', from).lte('date', to);
  const { data } = await query.order('date', { ascending: true }).limit(opts.limit ?? 10000);
  return (data ?? []) as BankTransaction[];
}

export async function getSummary(country: Country): Promise<{
  totalTx: number; income: number; expenses: number; net: number; bank: string; fy: string;
}> {
  const client = getClient(country);
  if (!client) return { totalTx: 0, income: 0, expenses: 0, net: 0, bank: '', fy: '' };
  const fy = FY_RANGE[country];
  const { data } = await client.from('transactions').select('amount,bank')
    .gte('date', fy.start).lte('date', fy.end);
  const txs = data ?? [];
  const income = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const banks = [...new Set(txs.map(t => t.bank))];
  return { totalTx: txs.length, income, expenses, net: income + expenses, bank: banks.join(','), fy: fy.label };
}

// ─── Journal Operations ───────────────────────────────────────

export interface JournalEntry {
  transaction_id?: string;
  date: string;
  account_code: string;
  account_name?: string;
  debit?: number;
  credit?: number;
  narration?: string;
  tax_code?: string;
  bas_code?: string;
  cca_class?: number;
}

export async function postJournal(country: Country, entries: JournalEntry[]): Promise<number> {
  const client = getClient(country);
  if (!client) return 0;
  let posted = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    const { error } = await client.from('ledger_journal').insert(batch);
    if (!error) posted += batch.length;
  }
  return posted;
}

// ─── Tax Return Operations ────────────────────────────────────

export async function saveBASReturn(basData: any): Promise<void> {
  const client = getClient('AU');
  if (!client) return;
  await client.from('bas_return').upsert(basData);
}

export async function saveGSTHSTReturn(gstData: any): Promise<void> {
  const client = getClient('CA');
  if (!client) return;
  await client.from('gst_hst_return').upsert(gstData);
}
