// lib/supabase.ts — Supabase client (optional cloud backend)
// PHLedger runs in local CSV mode when env vars are not set.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Transaction } from '@/types/index';

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: Transaction & { uploaded_at: string };
        Insert: Omit<Transaction, never>;
        Update: Partial<Transaction>;
      };
      migration_log: {
        Row: { id: number; run_at: string; total_transactions: number; banks_included: string[]; notes: string };
        Insert: { total_transactions: number; banks_included: string[]; notes?: string };
        Update: never;
      };
    };
  };
};

let _client: SupabaseClient<Database> | null = null;

export function supabaseEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseEnabled()) return null;
  if (!_client) {
    _client = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }
  return _client;
}

const BATCH_SIZE = 500;

export async function upsertTransactions(txs: Transaction[]): Promise<number> {
  const client = getSupabaseClient();
  if (!client) return 0;
  let count = 0;
  for (let i = 0; i < txs.length; i += BATCH_SIZE) {
    const batch = txs.slice(i, i + BATCH_SIZE);
    await client.from('transactions').upsert(batch as any);
    count += batch.length;
  }
  return count;
}

export async function fetchTransactions(opts: {
  bank?: string;
  currency?: string;
  limit?: number;
} = {}): Promise<Transaction[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  let query = client.from('transactions').select('*');
  if (opts.bank) query = query.eq('bank', opts.bank);
  if (opts.currency) query = query.eq('currency', opts.currency);
  const { data } = await query
    .order('date', { ascending: false })
    .limit(opts.limit ?? 10_000);
  return (data ?? []) as Transaction[];
}

export async function logMigration(stats: {
  total_transactions: number;
  banks_included: string[];
  notes?: string;
}): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('migration_log').insert(stats as any);
}
