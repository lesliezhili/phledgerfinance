// pages/api/seed-schemas.ts — Load ANZ/RBC data into phledger_au / phledger_ca schemas
import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAll, loadCountry } from '@/lib/store.js';
import { autoCategorise } from '@/lib/categoriser.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtfbcvefttirngkjuqvl.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
  
  if (!supabaseKey) return res.status(500).json({ error: 'SUPABASE_KEY not configured' });

  const { createClient } = await import('@supabase/supabase-js');
  
  // ═══ AUSTRALIA: FY2026-27 (Jul 2026 – Dec 2026 loaded) ═══
  const auClient = createClient(supabaseUrl, supabaseKey, { db: { schema: 'phledger_au' } });
  const auTxsRaw = loadCountry('AU');
  const auTxs = autoCategorise(auTxsRaw)
    .filter((t: any) => t.date >= '2026-07-01' && t.date <= '2026-12-31')
    .map((t: any) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      currency: 'AUD',
      bank: t.bank || 'anz',
      account_code: t.account_code,
      coa_code: t.account_code,
      coa_name: t.category,
      tax_code: t.tax_code,
      gst_amount: t.amount > 0 ? Math.round(t.amount / 11 * 100) / 100 : Math.round(Math.abs(t.amount) / 11 * 100) / 100,
      category: t.category,
      is_reconciled: true,
    }));

  let auLoaded = 0;
  for (let i = 0; i < auTxs.length; i += 500) {
    const batch = auTxs.slice(i, i + 500);
    const { error } = await auClient.from('transactions').upsert(batch);
    if (!error) auLoaded += batch.length;
    else console.error('AU load error:', error.message);
  }

  // ═══ CANADA: FY2026 (Jan 2026 – Dec 2026) ═══
  const caClient = createClient(supabaseUrl, supabaseKey, { db: { schema: 'phledger_ca' } });
  const caTxsRaw = loadCountry('CA');
  const caTxs = autoCategorise(caTxsRaw)
    .filter((t: any) => t.date >= '2026-01-01' && t.date <= '2026-12-31')
    .map((t: any) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      currency: 'CAD',
      bank: t.bank || 'rbc',
      account_code: t.account_code,
      coa_code: t.account_code,
      coa_name: t.category,
      tax_code: t.tax_code,
      hst_amount: t.amount > 0 ? Math.round(t.amount * 0.13 / 1.13 * 100) / 100 : Math.round(Math.abs(t.amount) * 0.13 / 1.13 * 100) / 100,
      category: t.category,
      province: 'ON',
      is_reconciled: true,
    }));

  let caLoaded = 0;
  for (let i = 0; i < caTxs.length; i += 500) {
    const batch = caTxs.slice(i, i + 500);
    const { error } = await caClient.from('transactions').upsert(batch);
    if (!error) caLoaded += batch.length;
    else console.error('CA load error:', error.message);
  }

  res.json({
    success: true,
    australia: {
      schema: 'phledger_au',
      fy: '2026-27 (Jul 2026 – Jun 2027)',
      loaded_period: 'Jul 2026 – Dec 2026',
      transactions: auLoaded,
      bank: 'ANZ',
      currency: 'AUD',
    },
    canada: {
      schema: 'phledger_ca',
      fy: '2026 (Jan – Dec)',
      loaded_period: 'Jan 2026 – Dec 2026',
      transactions: caLoaded,
      bank: 'RBC',
      currency: 'CAD',
    },
    supabase_url: supabaseUrl,
  });
}
