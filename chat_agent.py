from datetime import date, timedelta
from pathlib import Path

from connectors.xero_connector import XeroConnector
from connectors.csv_ingestion import CSVIngestionManager

from logic.categoriser import auto_categorise
from logic.bas_au import generate_bas_draft
from logic.tax_au import draft_au_company_tax, draft_au_personal_tax
from logic.tax_ca import draft_ca_corporate_tax, draft_ca_personal_tax, generate_quarterly_gst
from logic.financial_statements import generate_financial_statements

from models import ChatResponse


class PHLedgerAgent:
    def __init__(self):
        # CSV ingestion manager
        base = Path(__file__).resolve().parent / "bank_data"
        self.ingestor = CSVIngestionManager(base)

        # Initial migration connector (mock or real Xero later)
        self.xero_migration = XeroConnector()

    def migrate_from_xero(self):
        """
        One-time migration from XeroConnector into CSV folders.
        After this, CSV ingestion is the long-term source of truth.
        """
        base = Path(__file__).resolve().parent / "bank_data" / "anz"
        base.mkdir(parents=True, exist_ok=True)

        today = date.today()
        start = today - timedelta(days=365 * 7)

        txs = self.xero_migration.get_transactions(start, today)

        # Save into CSV by year/month
        for t in txs:
            year = str(t.date.year)
            month = f"{t.date.month:02d}"

            folder = base / year / month
            folder.mkdir(parents=True, exist_ok=True)

            csv_path = folder / f"{t.id}.csv"
            if not csv_path.exists():
                csv_path.write_text(
                    "date,description,amount,currency,id\n"
                    f"{t.date},{t.description},{t.amount},{t.currency},{t.id}\n"
                )

    def handle(self, msg: str) -> ChatResponse:
        msg = msg.lower()

        # Load CSV transactions
        anz = self.ingestor.load_bank("anz")
        rbc = self.ingestor.load_bank("rbc")

        # AU data
        au_tx = anz

        # CA data
        ca_tx = rbc

        today = date.today()
        start = today - timedelta(days=90)

        # Auto-categorise AU transactions
        au_tx = auto_categorise(au_tx, [])

        # Commands
        if "migrate" in msg:
            self.migrate_from_xero()
            return ChatResponse(message="Migration from Xero completed", data=None)

        if "bas" in msg:
            draft = generate_bas_draft(au_tx, start, today)
            return ChatResponse(message="AU BAS draft", data=draft.model_dump())

        if "au company" in msg:
            draft = draft_au_company_tax(today.year, au_tx)
            return ChatResponse(message="AU company tax", data=draft.model_dump())

        if "au personal" in msg:
            draft = draft_au_personal_tax(today.year, au_tx)
            return ChatResponse(message="AU personal tax", data=draft.model_dump())

        if "ca corporate" in msg:
            draft = draft_ca_corporate_tax(today.year, ca_tx)
            return ChatResponse(message="CA corporate tax", data=draft.model_dump())

        if "ca personal" in msg:
            draft = draft_ca_personal_tax(today.year, ca_tx)
            return ChatResponse(message="CA personal tax", data=draft.model_dump())

        if "quarterly gst" in msg:
            quarter = (today.month - 1) // 3 + 1
            draft = generate_quarterly_gst(today.year, quarter, ca_tx)
            return ChatResponse(message="Quarterly GST", data=draft.model_dump())

        if "annual tax au personal" in msg:
            draft = draft_au_personal_tax(today.year, au_tx)
            return ChatResponse(message="Annual AU personal tax", data=draft.model_dump())

        if "annual tax au company" in msg:
            draft = draft_au_company_tax(today.year, au_tx)
            return ChatResponse(message="Annual AU company tax", data=draft.model_dump())

        if "annual tax ca personal" in msg:
            draft = draft_ca_personal_tax(today.year, ca_tx)
            return ChatResponse(message="Annual CA personal tax", data=draft.model_dump())

        if "annual tax ca company" in msg:
            draft = draft_ca_corporate_tax(today.year, ca_tx)
            return ChatResponse(message="Annual CA company tax", data=draft.model_dump())

        if "financial statements" in msg:
            fs = generate_financial_statements(today, au_tx + ca_tx)
            return ChatResponse(message="Financial statements", data=fs.model_dump())

        if "p&l" in msg or "profit" in msg:
            income = sum(t.amount for t in au_tx if t.amount > 0)
            expenses = sum(abs(t.amount) for t in au_tx if t.amount < 0)
            return ChatResponse(
                message="P&L summary",
                data={"income": income, "expenses": expenses, "net": income - expenses},
            )

        return ChatResponse(message="Unknown command", data=None)
