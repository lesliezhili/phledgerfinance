// pages/api/silverconnect/payouts.js
// Generate provider payout report from all completed/cancelled bookings.
// GET  → payout summary grouped by provider
// POST → mark a provider as paid (update booking statuses)

import { generateProviderPayouts, generatePlatformPL, DEFAULT_PLATFORM_CONFIG } from '@/lib/silverconnect';
import path from 'path';
import fs from 'fs';

const DATA_DIR  = path.join(process.cwd(), 'sc_data');
const BOOK_PATH = path.join(DATA_DIR, 'bookings.json');
const CFG_PATH  = path.join(DATA_DIR, 'platform_config.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CFG_PATH, 'utf-8')); } catch {}
  return { ...DEFAULT_PLATFORM_CONFIG };
}
function loadBookings() {
  try { return JSON.parse(fs.readFileSync(BOOK_PATH, 'utf-8')); } catch {}
  return [];
}

export default function handler(req, res) {
  const config   = loadConfig();
  const bookings = loadBookings();

  if (req.method === 'GET') {
    const { provider_id, status } = req.query;
    let filtered = bookings;
    if (provider_id) filtered = filtered.filter(b => b.provider_id === provider_id);
    if (status)      filtered = filtered.filter(b => b.status === status);

    const payouts = generateProviderPayouts(filtered, config);
    const pl      = generatePlatformPL(filtered, config);
    return res.json({ payouts, platform_pl: pl, booking_count: filtered.length });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
