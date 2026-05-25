// lib/silverconnect.js
// SilverConnect Global — Platform Fee Engine
// Bookkeeping, provider payouts, and cancellation refunds
//
// All fee rates and cancellation policy come from the UPSTREAM SYSTEM
// (SilverConnect Global API). PHLedger stores the last-fetched config
// locally and applies it to every calculation.
//
// Upstream config shape mirrors SilverConnect platform_settings table:
//   platform_fee_rate       — e.g. 0.15  (15% retained by platform)
//   provider_rate           — e.g. 0.85  (85% paid to service provider)
//   cancellation_policy.*  — hours/rates for full/partial/no refund
//
// Account codes used in PHLedger COA:
//   210  Platform Fee Revenue       INCOME
//   211  Booking Gross Revenue      INCOME
//   212  Cancellation Fee Income    INCOME
//   820  Provider Payables          LIABILITY
//   821  Refunds Payable            LIABILITY
//   450  Refunds Expense            EXPENSE
//   451  Provider Clawback Offset   EXPENSE (credit)

// ─── Default config (used when upstream has not yet synced) ────────────
export const DEFAULT_PLATFORM_CONFIG = {
  platform_name:    'SilverConnect Global',
  platform_fee_rate: 0.15,          // 15% retained by platform
  provider_rate:     0.85,          // 85% paid to service provider
  currency:          'AUD',
  gst_rate:          0.10,          // AU GST included in gross amount
  cancellation_policy: {
    full_refund_hours:    24,        // >= 24h notice → full refund to client
    partial_refund_hours:  2,        // >= 2h notice  → partial refund
    partial_refund_rate:   0.50,     // 50% of gross returned if partial
    no_show_refund_rate:   0.00,     // 0% returned for no-show
    platform_fee_refundable: true,   // platform fee is also refunded
    cancellation_fee_rate:   0.05,   // 5% admin fee on partial cancellations
  },
  last_updated:     new Date().toISOString().slice(0, 10),
  upstream_source:  'silverconnect-global',
  upstream_synced:  false,
};

// ─── Fee Calculation ────────────────────────────────────────────────────

/**
 * Split a booking gross amount into platform fee + provider payout.
 * All rates come from config (upstream system).
 *
 * @param {number} grossAmount   - Total charged to client (inc. GST if AU)
 * @param {object} config        - Platform config from upstream system
 * @returns {FeeBreakdown}
 */
export function calculateFees(grossAmount, config = DEFAULT_PLATFORM_CONFIG) {
  const r       = parseFloat(config.platform_fee_rate) || 0.15;
  const gross   = round2(parseFloat(grossAmount) || 0);
  const gstRate = parseFloat(config.gst_rate) || 0;

  const platformFee   = round2(gross * r);
  const providerPayout = round2(gross - platformFee);

  // GST breakdown (AU: GST is 1/11 of GST-inclusive amount)
  const gstOnGross    = gstRate > 0 ? round2(gross * gstRate / (1 + gstRate)) : 0;
  const gstOnFee      = gstRate > 0 ? round2(platformFee * gstRate / (1 + gstRate)) : 0;
  const netFeeExGst   = round2(platformFee - gstOnFee);

  return {
    gross_amount:      gross,
    platform_fee_rate: r,
    platform_fee:      platformFee,
    provider_rate:     round2(1 - r),
    provider_payout:   providerPayout,
    gst_on_gross:      gstOnGross,
    gst_on_fee:        gstOnFee,
    net_fee_ex_gst:    netFeeExGst,
    currency:          config.currency || 'AUD',
  };
}

// ─── Cancellation Refund ────────────────────────────────────────────────

/**
 * Calculate refund and clawback amounts for a cancelled booking.
 * All thresholds and rates come from config.cancellation_policy (upstream).
 *
 * @param {object} booking        - { booking_id, gross_amount, ... }
 * @param {number|null} hoursNotice - Hours before service start that cancellation was requested.
 *                                    null = policy decision deferred to upstream.
 * @param {object} config         - Platform config (from upstream system)
 * @returns {RefundBreakdown}
 */
export function calculateRefund(booking, hoursNotice, config = DEFAULT_PLATFORM_CONFIG) {
  const policy = { ...DEFAULT_PLATFORM_CONFIG.cancellation_policy, ...(config.cancellation_policy || {}) };
  const fees   = calculateFees(booking.gross_amount, config);

  let refundRate   = 0;
  let refundType   = 'none';
  let cancFeeRate  = 0;

  if (hoursNotice === null || hoursNotice === undefined) {
    // Upstream system has not provided a determination — flag for review
    refundType = 'pending_upstream';
    refundRate = 0;
  } else if (hoursNotice >= (policy.full_refund_hours || 24)) {
    refundType = 'full';
    refundRate = 1.0;
    cancFeeRate = 0;
  } else if (hoursNotice >= (policy.partial_refund_hours || 2)) {
    refundType = 'partial';
    refundRate = parseFloat(policy.partial_refund_rate) || 0.50;
    cancFeeRate = parseFloat(policy.cancellation_fee_rate) || 0;
  } else {
    refundType = 'none';
    refundRate = parseFloat(policy.no_show_refund_rate) || 0;
  }

  const rawClientRefund       = round2(fees.gross_amount * refundRate);
  const cancFee               = round2(fees.gross_amount * cancFeeRate);  // admin fee deducted from refund
  const clientRefund          = round2(rawClientRefund - cancFee);
  const providerClawback      = round2(fees.provider_payout * refundRate);
  const platformFeeRefund     = policy.platform_fee_refundable
    ? round2(fees.platform_fee * refundRate)
    : 0;
  const platformRetained      = round2(fees.platform_fee - platformFeeRefund + cancFee);

  // Double-entry accounting lines for this refund event
  const journalEntries = _refundJournal({
    booking_id: booking.booking_id,
    clientRefund, platformFeeRefund, providerClawback, cancFee,
    fees, refundType,
  });

  return {
    booking_id:          booking.booking_id,
    gross_amount:        fees.gross_amount,
    hours_notice:        hoursNotice,
    refund_type:         refundType,
    refund_rate:         refundRate,
    client_refund:       clientRefund,
    cancellation_fee:    cancFee,
    provider_clawback:   providerClawback,
    platform_fee_refund: platformFeeRefund,
    platform_retained:   platformRetained,
    status:              refundType === 'pending_upstream' ? 'PENDING' : 'CALCULATED',
    journal_entries:     journalEntries,
  };
}

// ─── Provider Payout Report ─────────────────────────────────────────────

/**
 * Aggregate provider payouts across a list of bookings.
 * Clawbacks from cancelled bookings are deducted from net payout.
 *
 * @param {object[]} bookings   - Array of booking objects (with optional .refund)
 * @param {object}   config     - Platform config
 * @returns {ProviderPayout[]}
 */
export function generateProviderPayouts(bookings, config = DEFAULT_PLATFORM_CONFIG) {
  const byProvider = {};

  for (const b of bookings) {
    const pid  = b.provider_id   || 'unknown';
    const pnm  = b.provider_name || pid;

    if (!byProvider[pid]) {
      byProvider[pid] = {
        provider_id:        pid,
        provider_name:      pnm,
        booking_count:      0,
        completed_count:    0,
        cancelled_count:    0,
        gross_total:        0,
        platform_fee_total: 0,
        payout_gross:       0,
        clawback_total:     0,
        net_payout:         0,
        currency:           config.currency || 'AUD',
      };
    }

    const p    = byProvider[pid];
    const fees = calculateFees(b.gross_amount, config);

    p.booking_count++;
    p.gross_total        = round2(p.gross_total        + fees.gross_amount);
    p.platform_fee_total = round2(p.platform_fee_total + fees.platform_fee);
    p.payout_gross       = round2(p.payout_gross       + fees.provider_payout);

    if (b.status === 'cancelled' || b.status === 'refunded') {
      p.cancelled_count++;
      const clawback = b.refund?.provider_clawback ?? 0;
      p.clawback_total = round2(p.clawback_total + clawback);
    } else {
      p.completed_count++;
    }
  }

  for (const p of Object.values(byProvider)) {
    p.net_payout = round2(p.payout_gross - p.clawback_total);
  }

  return Object.values(byProvider).sort((a, b) => b.net_payout - a.net_payout);
}

// ─── Platform P&L ──────────────────────────────────────────────────────

/**
 * Generate platform-level P&L from a batch of bookings.
 *
 * @param {object[]} bookings - Booking array (may include .refund objects)
 * @param {object}   config   - Platform config
 * @returns {PlatformPL}
 */
export function generatePlatformPL(bookings, config = DEFAULT_PLATFORM_CONFIG) {
  let grossBookings   = 0, feeRevenue   = 0, providerPayouts = 0;
  let refundsIssued   = 0, clawbacks    = 0, cancFees        = 0;
  let completed = 0, cancelled = 0, pending = 0;

  for (const b of bookings) {
    const fees = calculateFees(b.gross_amount, config);
    grossBookings = round2(grossBookings + fees.gross_amount);

    if (b.status === 'completed') {
      feeRevenue    = round2(feeRevenue    + fees.platform_fee);
      providerPayouts = round2(providerPayouts + fees.provider_payout);
      completed++;
    } else if (b.status === 'cancelled' || b.status === 'refunded') {
      cancelled++;
      if (b.refund) {
        refundsIssued = round2(refundsIssued + (b.refund.client_refund   || 0));
        clawbacks     = round2(clawbacks     + (b.refund.provider_clawback || 0));
        cancFees      = round2(cancFees      + (b.refund.cancellation_fee || 0));
        feeRevenue    = round2(feeRevenue    + (b.refund.platform_retained || 0));
      }
    } else {
      pending++;
    }
  }

  const netRevenue = round2(feeRevenue + cancFees - refundsIssued);

  return {
    period:               new Date().toISOString().slice(0, 7),
    platform_fee_rate:    config.platform_fee_rate,
    provider_rate:        config.provider_rate,
    currency:             config.currency || 'AUD',
    total_gross_bookings: grossBookings,
    total_fee_revenue:    feeRevenue,
    total_provider_payouts: providerPayouts,
    total_refunds_issued: refundsIssued,
    total_clawbacks:      clawbacks,
    total_cancellation_fees: cancFees,
    net_platform_revenue: netRevenue,
    booking_counts:       { completed, cancelled, pending, total: bookings.length },
    effective_fee_rate:   grossBookings > 0 ? round2(netRevenue / grossBookings) : 0,
  };
}

// ─── Upstream Config Merge ──────────────────────────────────────────────

/**
 * Merge an upstream config payload (from SilverConnect API) into the base config.
 * Upstream values take precedence. Nested cancellation_policy is deep-merged.
 *
 * @param {object} base     - Current stored config
 * @param {object} upstream - Payload from SilverConnect API
 * @returns {PlatformConfig}
 */
export function applyUpstreamConfig(base, upstream) {
  if (!upstream) return base;
  return {
    ...base,
    ...upstream,
    cancellation_policy: {
      ...(base?.cancellation_policy      || {}),
      ...(upstream?.cancellation_policy  || {}),
    },
    last_updated:    new Date().toISOString().slice(0, 10),
    upstream_synced: true,
  };
}

// ─── Double-Entry Journal Helper ────────────────────────────────────────

function _refundJournal({ booking_id, clientRefund, platformFeeRefund, providerClawback, cancFee, fees, refundType }) {
  if (refundType === 'none' || refundType === 'pending_upstream') return [];

  const entries = [];
  if (clientRefund > 0) {
    entries.push({ dr: '821 Refunds Payable',          cr: '600 Cash at Bank',          amount: clientRefund,     note: 'Client refund issued' });
  }
  if (platformFeeRefund > 0) {
    entries.push({ dr: '210 Platform Fee Revenue',     cr: '821 Refunds Payable',       amount: platformFeeRefund, note: 'Platform fee reversed' });
  }
  if (providerClawback > 0) {
    entries.push({ dr: '820 Provider Payables',        cr: '451 Provider Clawback',     amount: providerClawback, note: 'Provider clawback on cancel' });
  }
  if (cancFee > 0) {
    entries.push({ dr: '600 Cash at Bank',             cr: '212 Cancellation Fee Income', amount: cancFee,        note: 'Cancellation admin fee' });
  }
  return entries;
}

// ─── Utility ────────────────────────────────────────────────────────────

function round2(n) { return Math.round((parseFloat(n) || 0) * 100) / 100; }
