# PHLedger

**Free open-source bookkeeping for Australian and Canadian small businesses.**

[![CI/CD](https://github.com/lesliezhili/phledgertax/actions/workflows/ci.yml/badge.svg)](https://github.com/lesliezhili/phledgertax/actions)

## Features

- Import CSV exports from **9 banks**: ANZ, NAB, CBA, Westpac (AU) · RBC, TD, BMO, Scotiabank, CIBC (CA)
- Auto-categorisation with 26-account Chart of Accounts and 16 keyword rules
- **AU**: BAS drafts (G1/G11/1A/1B), quarterly BAS, company & personal tax estimates (Stage 3 2024-25)
- **CA**: GST/HST quarterly & annual, corporate & personal tax (2024 brackets + BPA credit)
- Financial statements: P&L, Balance Sheet, Cash Flow
- AI assistant chat interface
- Optional Supabase cloud backend (runs fully local/offline without it)

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript + TypeScript types |
| UI | React 18 + Bootstrap 5.3 + Chart.js 4 |
| API | Next.js API Routes (serverless) |
| Storage | CSV files (local) or Supabase (cloud) |
| Deploy | Vercel (free tier) |

## Quick Start

```bash
# Install
npm install

# Run locally
npm run dev
# → http://localhost:3000

# Type-check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Environment Variables (optional — for Supabase cloud mode)

Create `.env.local`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
BANK_DATA_PATH=/custom/path/to/bank_data   # optional override
```

Without these, PHLedger runs in **local CSV mode** using `./bank_data/` directory.

## Bank Data Structure

```
bank_data/
  anz/2025/07/transactions.csv
  rbc/2025/10/transactions.csv
  ...
```

Place exported CSVs in the appropriate `bank/year/month/` folder, then use **Banking → Upload** in the UI.

## Deployment

Push to `main` → Vercel auto-deploys. CI runs lint + build on every push/PR.

## License

MIT — free forever.
