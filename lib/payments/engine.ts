/**
 * PHLedger Payments Engine — Open-source marketplace payment orchestration
 * 
 * Alternative to Stripe Connect for AU/CA platforms.
 * Handles: split payments, escrow, provider payouts, refunds, platform fees.
 * 
 * Payment flow:
 *   Customer pays → Platform holds (escrow) → Service completes → Provider gets paid (minus platform fee)
 * 
 * Supported payment rails:
 *   AU: PayTo (NPP real-time), BECS Direct Debit, BPay
 *   CA: Interac e-Transfer, EFT (ACH-equivalent)
 *   Fallback: Stripe (for card payments)
 */

export interface PaymentConfig {
  platformFeePercent: number;   // e.g., 15 (platform takes 15%)
  gstRate: number;              // e.g., 0.10 (10% GST on platform fee)
  escrowHoldHours: number;      // hours to hold before auto-release (e.g., 48)
  currency: "AUD" | "CAD";
  paymentRails: ("payto" | "becs" | "interac" | "eft" | "stripe")[];
}

export interface SplitPayment {
  id: string;
  orderId: string;
  customerAmount: number;       // total customer pays
  platformFee: number;          // platform takes
  platformGst: number;          // GST on platform fee
  providerPayout: number;       // provider receives
  status: "pending" | "captured" | "in_escrow" | "released" | "refunded" | "disputed";
  capturedAt?: string;
  releasedAt?: string;
  escrowExpiresAt?: string;
}

export const DEFAULT_AU_CONFIG: PaymentConfig = {
  platformFeePercent: 15,
  gstRate: 0.10,
  escrowHoldHours: 48,
  currency: "AUD",
  paymentRails: ["payto", "becs", "stripe"],
};

export const DEFAULT_CA_CONFIG: PaymentConfig = {
  platformFeePercent: 15,
  gstRate: 0.05, // 5% GST Canada
  escrowHoldHours: 48,
  currency: "CAD",
  paymentRails: ["interac", "eft", "stripe"],
};

/**
 * Calculate split payment breakdown
 */
export function calculateSplit(
  totalAmount: number,
  config: PaymentConfig
): { platformFee: number; platformGst: number; providerPayout: number } {
  const platformFee = Math.round(totalAmount * (config.platformFeePercent / 100) * 100) / 100;
  const platformGst = Math.round(platformFee * config.gstRate * 100) / 100;
  const providerPayout = Math.round((totalAmount - platformFee) * 100) / 100;
  return { platformFee, platformGst, providerPayout };
}

/**
 * Create a split payment record
 */
export function createSplitPayment(
  orderId: string,
  customerAmount: number,
  config: PaymentConfig
): SplitPayment {
  const { platformFee, platformGst, providerPayout } = calculateSplit(customerAmount, config);
  const now = new Date();
  return {
    id: `PAY-${Date.now()}`,
    orderId,
    customerAmount,
    platformFee,
    platformGst,
    providerPayout,
    status: "pending",
    escrowExpiresAt: new Date(now.getTime() + config.escrowHoldHours * 3600000).toISOString(),
  };
}
