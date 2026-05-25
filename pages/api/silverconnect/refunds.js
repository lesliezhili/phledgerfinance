// pages/api/silverconnect/refunds.js
// Process cancellation refund for a booking.
// POST → calculate refund based on upstream policy, update booking status
// GET  → list all refunds

import { calculateRefund, DEFAULT_PLATFORM_CONFIG } from '@/lib/silverconnect';
import path from 'path';
import fs from 'fs';

const DATA_DIR    = path.join(process.cwd(), 'sc_data');
const BOOK_PATH   = path.join(DATA_DIR, 'bookings.json');
const REFUND_PATH = path.join(DATA_DIR, 'refunds.json');
const CFG_PATH    = path.join(DATA_DIR, 'platform_config.json');

function load(p, def = [])  { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return def; } }
function save(p, d)         { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

export default function handler(req, res) {
  const config = load(CFG_PATH, DEFAULT_PLATFORM_CONFIG);

  if (req.method === 'GET') {
    return res.json({ refunds: load(REFUND_PATH) });
  }

  if (req.method === 'POST') {
    const { booking_id, hours_notice, reason } = req.body || {};

    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });

    // Hours notice may come from upstream system (null = pending upstream decision)
    const hoursNotice = hours_notice !== undefined && hours_notice !== null
      ? parseFloat(hours_notice)
      : null;

    const bookings = load(BOOK_PATH);
    const booking  = bookings.find(b => b.booking_id === booking_id);

    if (!booking) return res.status(404).json({ error: `Booking ${booking_id} not found` });
    if (booking.status === 'refunded') {
      return res.status(409).json({ error: `Booking ${booking_id} has already been refunded` });
    }

    const refund = calculateRefund(booking, hoursNotice, config);

    // Update booking status
    const updatedBookings = bookings.map(b =>
      b.booking_id === booking_id
        ? { ...b, status: refund.refund_type === 'pending_upstream' ? 'pending_refund' : 'refunded', refund }
        : b
    );
    save(BOOK_PATH, updatedBookings);

    // Append to refunds log
    const refunds = load(REFUND_PATH);
    const refundRecord = {
      refund_id:    `RF-${Date.now()}`,
      booking_id,
      ...refund,
      reason:       reason || '',
      processed_at: new Date().toISOString(),
      processed_by: 'system',             // upstream system or manual
    };
    refunds.push(refundRecord);
    save(REFUND_PATH, refunds);

    return res.status(201).json({
      status:  refund.status,
      refund:  refundRecord,
      message: refund.refund_type === 'pending_upstream'
        ? 'Refund awaiting upstream policy determination'
        : `${refund.refund_type} refund of $${refund.client_refund} processed`,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
