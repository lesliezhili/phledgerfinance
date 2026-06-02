import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_KEY || '';
const sb = url && key ? createClient(url, key) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, rating, message, category } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const fb = { email: email || 'anonymous', rating: rating || 5, message, category: category || 'general', created_at: new Date().toISOString() };
  if (sb) await sb.from('feedback').insert(fb);
  res.json({ success: true, message: 'Thank you for your feedback!' });
}
