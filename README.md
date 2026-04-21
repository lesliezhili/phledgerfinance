# PHLedgerTax – Free End-to-End Bookkeeping for AU & CA

PHLedgerTax is a local, offline, free accounting agent that ingests ANZ + RBC CSVs, auto-categorises transactions, computes AU/CA tax + BAS + P&L, provides a Claude-style chat UI, supports initial XeroMock migration, and runs entirely on your Mac with no cloud or subscriptions.

## Features

- **CSV Ingestion**: Loads all CSVs from folder structure, deduplicates
- **Auto-Categorisation**: Basic rules for income/expenses
- **Tax Calculations**:
  - AU BAS (GST)
  - AU Company Tax
  - AU Personal Tax
  - CA Corporate Tax
  - CA Personal Tax
- **P&L Summary**
- **Chat UI**: Claude-style interface
- **Bank Feeds Panel**: Upload CSVs, drag-and-drop
- **Analytics**: Basic transaction stats
- **CI/CD**: GitHub Actions for testing
- **Deployment**: Docker-ready for free hosting

## Quick Start

### Mac App

1. Open Automator, create new Application
2. Add "Run Shell Script" action
3. Paste: `cd /path/to/phledgertax && bash run.sh`
4. Save as PHLedgerTax.app
5. Run the app to start server and open UI

### Folder Structure

Run `python create_folders.py` to create bank_data/anz/ and bank_data/rbc/ with year/month subfolders.

### Upload CSVs

Use the UI to upload ANZ/RBC CSVs. They are auto-routed to correct folders based on date.

### Commands

In chat: "migrate", "bas", "au company", "au personal", "ca corporate", "ca personal", "p&l"

## Automated Bank Downloads

### Setup Credentials

To use automated ANZ/RBC downloads, set environment variables:

```bash
export ANZ_USERNAME="your-anz-username"
export ANZ_PASSWORD="your-anz-password"

export RBC_USERNAME="your-rbc-username"
export RBC_PASSWORD="your-rbc-password"
```

### Usage

**Via UI**: Click "Auto-Download ANZ" or "Auto-Download RBC" in the Bank Feeds panel.

**Via API**:
```bash
curl -X POST http://localhost:8000/download-bank \
  -F "bank=anz" \
  -F "days=30"
```

### Warning

Automating bank logins may violate the bank's terms of service. Use at your own risk. Downloaded CSVs are saved to `bank_downloads/` folder and auto-ingested.

### Limitations

- Some banks may block automated logins
- 2FA may require manual intervention
- HTML element selectors may change if banks update their UI

### Alternative

Instead of automated downloads, you can:
1. Manually download CSV from your bank website
2. Use the "Upload" button in the UI
3. The CSV is auto-routed to the correct folder based on transaction dates

### Docker

```bash
docker build -t phledgertax .
docker run -p 8000:8000 phledgertax
```

### Free Hosting

- **Railway**: Connect GitHub repo, deploy from Docker
- **Render**: Use Dockerfile, free tier
- **Azure**: Use azd for free App Service

### CI/CD

GitHub Actions runs tests on push/PR. Deploys on main branch.

## Future

- SQLite ledger
- Advanced analytics with charts
- Automated CSV downloads (experimental)
- Multi-entity support

## License

Free for personal use.
