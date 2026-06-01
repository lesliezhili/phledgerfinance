# PHLedger + Tax

**Free open-source bookkeeping, payments & tax engine for AU/CA marketplace platforms.**

[![CI/CD](https://github.com/lesliezhili/phledgertax/actions/workflows/ci.yml/badge.svg)](https://github.com/lesliezhili/phledgertax/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 What Is This?

An open-source alternative to Stripe + Xero for marketplace platforms (like SilverConnect). Self-hosted, AU/CA tax-compliant, zero payment processing fees on bank-rail transactions.

## 📦 Modules

| Module | Description | Status |
|--------|-------------|--------|
| **Bookkeeping** | CSV import from 9 banks, auto-categorisation, Chart of Accounts | ✅ Live |
| **BAS/Tax** | AU BAS drafts (G1/G11/1A/1B), CA GST filing | ✅ Live |
| **Payments Engine** | Marketplace split payments, escrow, provider payouts | 🚧 New |
| **Xero Connector** | OAuth 2.0, invoice sync, BAS data push | 🚧 New |
| **PayTo (AU)** | NPP real-time payments via PayTo mandates | 📋 Planned |
| **Interac (CA)** | Interac e-Transfer integration | 📋 Planned |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Platform                     │
│          (e.g., SilverConnect Global)            │
├─────────────────────────────────────────────────┤
│                                                   │
│  lib/payments/engine.ts  ←── Split payment logic  │
│  connectors/xero/        ←── Xero 2-way sync     │
│  lib/basAu.js            ←── AU BAS generation    │
│  lib/taxCa.js            ←── CA GST filing        │
│  lib/csvIngestion.js     ←── Bank CSV import      │
│                                                   │
├─────────────────────────────────────────────────┤
│  Payment Rails                                    │
│  ├── PayTo (AU NPP) — $0 fee, real-time          │
│  ├── BECS Direct Debit — $0.30/tx                 │
│  ├── Interac e-Transfer (CA) — $0 fee             │
│  └── Stripe (fallback for cards) — 1.7%+30c      │
└─────────────────────────────────────────────────┘
```

## 💰 Payments Engine

```typescript
import { createSplitPayment, DEFAULT_AU_CONFIG } from "./lib/payments/engine";

// Customer pays $100 for a service
const payment = createSplitPayment("ORDER-001", 100, {
  ...DEFAULT_AU_CONFIG,
  platformFeePercent: 15, // You keep 15%
});

// Result:
// payment.customerAmount = $100
// payment.platformFee = $15
// payment.platformGst = $1.50 (GST on your fee)
// payment.providerPayout = $85
// payment.status = "pending" → "in_escrow" → "released"
```

## 🔗 Xero Integration

```typescript
import { getXeroAuthUrl, createXeroInvoice } from "./connectors/xero";

// 1. Redirect user to Xero OAuth
const authUrl = getXeroAuthUrl(config, "random-state");

// 2. After callback, create invoice
const result = await createXeroInvoice(invoice, tokens);
```

## 🇦🇺 AU Tax (BAS)

- Auto-calculates G1, G11, 1A, 1B fields
- Quarterly BAS draft generation
- GST-inclusive / GST-exclusive handling
- ABN validation

## 🇨🇦 CA Tax (GST/HST)

- Federal GST (5%) + Provincial HST where applicable
- Input Tax Credit (ITC) tracking
- GST/HST filing periods

## 🏦 Supported Banks (CSV Import)

**Australia:** ANZ, NAB, CBA, Westpac
**Canada:** RBC, TD, BMO, Scotiabank, CIBC

## 🛠️ Setup

```bash
git clone https://github.com/lesliezhili/phledgertax.git
cd phledgertax
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
# Xero OAuth (get from https://developer.xero.com)
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback

# Supabase (for storage)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (fallback for card payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## 📄 License

MIT — Free for personal and commercial use.

## 🙏 Foundation

Built with love. God / Jesus / Spirit.
