// __tests__/lib/silverconnect.test.ts
// SilverConnect Global — Platform Fee Engine Tests
// 14 tests: fees, refunds, payouts, P&L, upstream config override

import {
  DEFAULT_PLATFORM_CONFIG,
  calculateFees,
  calculateRefund,
  generateProviderPayouts,
  generatePlatformPL,
  applyUpstreamConfig,
} from '@/lib/silverconnect';

// ─── calculateFees ───────────────────────────────────────────────────

describe('calculateFees', () => {
  test('standard 85/15 split on $100', () => {
    const f = calculateFees(100);
    expect(f.platform_fee).toBe(15);
    expect(f.provider_payout).toBe(85);
    expect(f.gross_amount).toBe(100);
  });

  test('gross = platform_fee + provider_payout always', () => {
    [50, 137.50, 1000, 0.01].forEach(gross => {
      const f = calculateFees(gross);
      expect(f.platform_fee + f.provider_payout).toBe(f.gross_amount);
    });
  });

  test('upstream override: 10% platform fee', () => {
    const config = { ...DEFAULT_PLATFORM_CONFIG, platform_fee_rate: 0.10, provider_rate: 0.90 };
    const f = calculateFees(200, config);
    expect(f.platform_fee).toBe(20);
    expect(f.provider_payout).toBe(180);
  });

  test('GST breakdown — 10% GST', () => {
    const f = calculateFees(110, DEFAULT_PLATFORM_CONFIG);  // $110 GST-inclusive
    expect(f.gst_on_gross).toBeCloseTo(10, 1);             // 1/11 of $110 = $10
  });

  test('zero amount returns all zeros', () => {
    const f = calculateFees(0);
    expect(f.platform_fee).toBe(0);
    expect(f.provider_payout).toBe(0);
  });
});

// ─── calculateRefund ────────────────────────────────────────────────

describe('calculateRefund', () => {
  const booking = { booking_id: 'BK-001', gross_amount: 100 };

  test('full refund (>= 24h notice)', () => {
    const r = calculateRefund(booking, 48);
    expect(r.refund_type).toBe('full');
    expect(r.client_refund).toBe(100);
    expect(r.provider_clawback).toBe(85);
    expect(r.platform_retained).toBe(0);
  });

  test('partial refund (>= 2h, < 24h notice) at 50%', () => {
    const r = calculateRefund(booking, 12);
    expect(r.refund_type).toBe('partial');
    expect(r.client_refund).toBeLessThan(100);
    expect(r.client_refund).toBeGreaterThan(0);
    expect(r.provider_clawback).toBeCloseTo(85 * 0.50, 1);
  });

  test('no refund (< 2h notice)', () => {
    const r = calculateRefund(booking, 1);
    expect(r.refund_type).toBe('none');
    expect(r.client_refund).toBe(0);
    expect(r.provider_clawback).toBe(0);
  });

  test('pending_upstream when hoursNotice is null', () => {
    const r = calculateRefund(booking, null);
    expect(r.refund_type).toBe('pending_upstream');
    expect(r.status).toBe('PENDING');
  });

  test('upstream policy override: full refund at 48h threshold', () => {
    const config = {
      ...DEFAULT_PLATFORM_CONFIG,
      cancellation_policy: { ...DEFAULT_PLATFORM_CONFIG.cancellation_policy, full_refund_hours: 48 },
    };
    const r24h = calculateRefund(booking, 24, config);   // 24h < 48h threshold → partial
    expect(r24h.refund_type).toBe('partial');
    const r48h = calculateRefund(booking, 48, config);   // 48h = threshold → full
    expect(r48h.refund_type).toBe('full');
  });

  test('platform_fee NOT refunded when platform_fee_refundable=false', () => {
    const config = {
      ...DEFAULT_PLATFORM_CONFIG,
      cancellation_policy: { ...DEFAULT_PLATFORM_CONFIG.cancellation_policy, platform_fee_refundable: false },
    };
    const r = calculateRefund(booking, 48, config);
    expect(r.platform_fee_refund).toBe(0);
    expect(r.platform_retained).toBe(15);  // platform keeps its 15%
  });

  test('journal entries generated for full refund', () => {
    const r = calculateRefund(booking, 48);
    expect(Array.isArray(r.journal_entries)).toBe(true);
    expect(r.journal_entries.length).toBeGreaterThan(0);
  });
});

// ─── generateProviderPayouts ─────────────────────────────────────────

describe('generateProviderPayouts', () => {
  const bookings = [
    { provider_id: 'P01', provider_name: 'Alice', gross_amount: 100, status: 'completed' },
    { provider_id: 'P01', provider_name: 'Alice', gross_amount: 200, status: 'completed' },
    { provider_id: 'P02', provider_name: 'Bob',   gross_amount: 150, status: 'cancelled',
      refund: { provider_clawback: 127.50 } },
  ];

  test('aggregates payouts by provider', () => {
    const payouts = generateProviderPayouts(bookings);
    const alice = payouts.find(p => p.provider_id === 'P01');
    expect(alice.booking_count).toBe(2);
    expect(alice.payout_gross).toBeCloseTo(255, 1);   // (100+200)*0.85
    expect(alice.net_payout).toBe(alice.payout_gross); // no clawback
  });

  test('deducts clawback from cancelled booking', () => {
    const payouts = generateProviderPayouts(bookings);
    const bob = payouts.find(p => p.provider_id === 'P02');
    expect(bob.net_payout).toBeCloseTo(127.50 - 127.50, 1); // clawback = full payout
  });
});

// ─── generatePlatformPL ──────────────────────────────────────────────

describe('generatePlatformPL', () => {
  const bookings = [
    { gross_amount: 100, status: 'completed' },
    { gross_amount: 200, status: 'completed' },
    { gross_amount: 50,  status: 'cancelled',
      refund: { client_refund: 50, provider_clawback: 42.50, platform_fee_refund: 7.50, platform_retained: 0, cancellation_fee: 0 } },
  ];

  test('net revenue = fees from completed - refunds issued', () => {
    const pl = generatePlatformPL(bookings);
    expect(pl.total_fee_revenue).toBeGreaterThan(0);
    expect(pl.total_refunds_issued).toBe(50);
    expect(pl.net_platform_revenue).toBeCloseTo(pl.total_fee_revenue - 50, 1);
  });

  test('booking counts are correct', () => {
    const pl = generatePlatformPL(bookings);
    expect(pl.booking_counts.completed).toBe(2);
    expect(pl.booking_counts.cancelled).toBe(1);
    expect(pl.booking_counts.total).toBe(3);
  });
});

// ─── applyUpstreamConfig ─────────────────────────────────────────────

describe('applyUpstreamConfig', () => {
  test('upstream rate replaces default', () => {
    const result = applyUpstreamConfig(DEFAULT_PLATFORM_CONFIG, { platform_fee_rate: 0.12 });
    expect(result.platform_fee_rate).toBe(0.12);
  });

  test('marks upstream_synced=true', () => {
    const result = applyUpstreamConfig(DEFAULT_PLATFORM_CONFIG, { platform_fee_rate: 0.10 });
    expect(result.upstream_synced).toBe(true);
  });

  test('null upstream returns base config unchanged', () => {
    const result = applyUpstreamConfig(DEFAULT_PLATFORM_CONFIG, null);
    expect(result).toEqual(DEFAULT_PLATFORM_CONFIG);
  });
});
