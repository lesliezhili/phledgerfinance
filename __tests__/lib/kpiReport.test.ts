// __tests__/lib/kpiReport.test.ts
// KPI Management Reporting Engine — 12 tests

import {
  KPI_CATALOGUE,
  calculateSCKPIs,
  calculateFinancialKPIs,
  buildScorecard,
  calculateTrend,
  buildSCTrends,
} from '@/lib/kpiReport';

const BOOKINGS_COMPLETE = [
  { booking_id: 'BK-01', provider_id: 'P01', gross_amount: 100, platform_fee: 15, provider_payout: 85, status: 'completed', service_date: '2026-05-01' },
  { booking_id: 'BK-02', provider_id: 'P02', gross_amount: 200, platform_fee: 30, provider_payout: 170, status: 'completed', service_date: '2026-05-02' },
];
const BOOKINGS_WITH_CANCEL = [
  ...BOOKINGS_COMPLETE,
  { booking_id: 'BK-03', provider_id: 'P01', gross_amount: 150, platform_fee: 22.5, provider_payout: 127.5, status: 'cancelled',
    service_date: '2026-05-03', refund: { client_refund: 150, provider_clawback: 127.5, cancellation_fee: 0, platform_retained: 0 } },
];

const TRANSACTIONS_AU = [
  { amount: 1000, currency: 'AUD', tax_code: 'GST_ON_INCOME', category: 'Service Revenue' },
  { amount: -200, currency: 'AUD', tax_code: 'GST', category: 'Office Expenses' },
  { amount: 500,  currency: 'AUD', tax_code: 'GST_ON_INCOME', category: 'Sales Revenue' },
];

// ─── calculateSCKPIs ────────────────────────────────────────────────

describe('calculateSCKPIs', () => {
  test('correct booking counts', () => {
    const r = calculateSCKPIs(BOOKINGS_COMPLETE);
    expect(r.SC01).toBe(2);
    expect(r.SC02).toBe(2);
    expect(r.SC03).toBe(0);  // no cancellations
  });

  test('platform fee and payout sums', () => {
    const r = calculateSCKPIs(BOOKINGS_COMPLETE);
    expect(r.SC04).toBeCloseTo(45, 2);   // 15+30
    expect(r.SC05).toBeCloseTo(255, 2);  // 85+170
  });

  test('cancellation rate with mixed statuses', () => {
    const r = calculateSCKPIs(BOOKINGS_WITH_CANCEL);
    expect(r.SC01).toBe(3);
    expect(r.SC03).toBeCloseTo(1/3, 3);  // 1 cancelled out of 3
  });

  test('active providers counted correctly', () => {
    const r = calculateSCKPIs(BOOKINGS_COMPLETE);
    expect(r.SC09).toBe(2);  // P01 + P02
  });

  test('avg booking value', () => {
    const r = calculateSCKPIs(BOOKINGS_COMPLETE);
    expect(r.SC07).toBeCloseTo(150, 2);  // (100+200)/2
  });
});

// ─── calculateFinancialKPIs ─────────────────────────────────────────

describe('calculateFinancialKPIs', () => {
  test('income, expenses, net profit', () => {
    const r = calculateFinancialKPIs(TRANSACTIONS_AU);
    expect(r.FI01).toBeCloseTo(1500, 2);  // 1000+500
    expect(r.FI02).toBeCloseTo(200, 2);   // abs(-200)
    expect(r.FI03).toBeCloseTo(1300, 2);  // 1500-200
  });

  test('gross profit margin', () => {
    const r = calculateFinancialKPIs(TRANSACTIONS_AU);
    expect(r.FI04).toBeCloseTo(1300/1500, 3);
  });

  test('AU GST collected is 1/11 of GST-inclusive income', () => {
    const r = calculateFinancialKPIs(TRANSACTIONS_AU);
    expect(r.FI05).toBeCloseTo(1500/11, 2);
  });

  test('empty transactions returns all zeros', () => {
    const r = calculateFinancialKPIs([]);
    expect(r.FI01).toBe(0);
    expect(r.FI03).toBe(0);
  });
});

// ─── buildScorecard ─────────────────────────────────────────────────

describe('buildScorecard', () => {
  test('ON_TRACK when actual meets target', () => {
    const sc = calculateSCKPIs(BOOKINGS_COMPLETE);
    const fi = calculateFinancialKPIs(TRANSACTIONS_AU);
    const scorecard = buildScorecard(sc, fi, { SC01: 2, SC04: 40 });
    const kpi01 = scorecard.cards.find(c => c.id === 'SC01');
    expect(kpi01.status).toBe('ON_TRACK');
    expect(kpi01.variance).toBe(0);
  });

  test('OFF_TRACK when actual significantly below target', () => {
    const sc = calculateSCKPIs(BOOKINGS_COMPLETE);
    const fi = calculateFinancialKPIs([]);
    const scorecard = buildScorecard(sc, fi, { SC01: 100 });  // target 100, actual 2
    const kpi01 = scorecard.cards.find(c => c.id === 'SC01');
    expect(kpi01.status).toBe('OFF_TRACK');
  });

  test('NO_TARGET when target is null', () => {
    const sc = calculateSCKPIs(BOOKINGS_COMPLETE);
    const fi = calculateFinancialKPIs([]);
    const scorecard = buildScorecard(sc, fi, {});
    const fi01 = scorecard.cards.find(c => c.id === 'FI01');
    expect(fi01.status).toBe('NO_TARGET');
  });

  test('summary counts are consistent', () => {
    const sc = calculateSCKPIs(BOOKINGS_COMPLETE);
    const fi = calculateFinancialKPIs(TRANSACTIONS_AU);
    const { summary } = buildScorecard(sc, fi, {});
    expect(summary.total).toBe(KPI_CATALOGUE.length);
    expect(summary.on_track + summary.at_risk + summary.off_track + summary.no_target + summary.no_data)
      .toBe(summary.total);
  });
});

// ─── calculateTrend ─────────────────────────────────────────────────

describe('calculateTrend', () => {
  test('upward trend detected', () => {
    const data = [
      { period: '2026-03', value: 100 },
      { period: '2026-04', value: 110 },
      { period: '2026-05', value: 130 },
    ];
    const t = calculateTrend(data, 'SC04');
    expect(t.direction).toBe('up');
    expect(t.mom_pct).toBeCloseTo(130/110 - 1, 2);
  });

  test('flat when <1% change', () => {
    const data = [{ period: '2026-04', value: 100 }, { period: '2026-05', value: 100.5 }];
    const t = calculateTrend(data, 'SC04');
    expect(t.direction).toBe('flat');
  });

  test('YTD total is sum of all periods', () => {
    const data = [
      { period: '2026-01', value: 10 },
      { period: '2026-02', value: 20 },
      { period: '2026-03', value: 30 },
    ];
    const t = calculateTrend(data, 'SC01');
    expect(t.ytd_total).toBe(60);
  });
});
