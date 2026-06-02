// PHLedger Pricing — AUD$ and CAD$
export interface PricingPlan {
  id: string;
  name: string;
  priceAUD: number;
  priceCAD: number;
  period: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  paymentRail: string;
}

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceAUD: 0,
    priceCAD: 0,
    period: 'month',
    features: [
      'Finance Agent (NL chat)',
      '1 bank account (ANZ or RBC)',
      'BAS generation (quarterly)',
      'Annual tax return draft',
      'Up to 500 transactions/month',
      'Email support',
    ],
    paymentRail: 'none',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceAUD: 29,
    priceCAD: 25,
    period: 'month',
    recommended: false,
    features: [
      'Everything in Free, plus:',
      'Unlimited bank accounts',
      'Up to 5,000 transactions/month',
      'PayTo payments (AU, $0/tx)',
      'Interac payments (CA, $0.25/tx)',
      'Auto-categorisation rules',
      'P&L + Balance Sheet reports',
      'CSV export',
      'Priority email support',
    ],
    paymentRail: 'PayTo NPP (AU) / Interac (CA)',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceAUD: 79,
    priceCAD: 69,
    period: 'month',
    recommended: true,
    features: [
      'Everything in Starter, plus:',
      'Unlimited transactions',
      'Multi-entity (AU + CA)',
      'Auto-reconciliation',
      'Cash flow forecasting',
      'BAS auto-lodge (ATO API)',
      'Supabase persistence (full history)',
      'API access',
      'Audit trail',
      'Phone + chat support',
    ],
    paymentRail: 'PayTo NPP (AU) / Interac (CA)',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceAUD: 199,
    priceCAD: 179,
    period: 'month',
    recommended: false,
    features: [
      'Everything in Professional, plus:',
      'Unlimited entities',
      'Custom categorisation rules',
      'Multi-user (team roles)',
      'SSO (SAML/OIDC)',
      'Dedicated support manager',
      'Custom integrations',
      'SLA (99.9% uptime)',
      'On-premise option available',
    ],
    paymentRail: 'PayTo NPP (AU) / Interac (CA) / BECS Direct Debit',
  },
];

export const ANNUAL_DISCOUNT = 0.20; // 20% off annual

export function getAnnualPrice(plan: PricingPlan, currency: 'AUD' | 'CAD') {
  const monthly = currency === 'AUD' ? plan.priceAUD : plan.priceCAD;
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));
}
