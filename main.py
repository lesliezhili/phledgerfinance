from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from models import ChatRequest, ChatResponse, Transaction
from chat_agent import PHLedgerAgent
from connectors.csv_ingestion import parse_csv_file
from db.store import TransactionStore, AU_BANKS, CA_BANKS
from logic.financial_statements import generate_financial_statements
from logic.bas_au import generate_bas_draft, generate_quarterly_bas
from logic.tax_au import draft_au_company_tax, draft_au_personal_tax
from logic.tax_ca import draft_ca_corporate_tax, draft_ca_personal_tax, generate_quarterly_gst, generate_annual_hst
from logic.categoriser import auto_categorise
from pathlib import Path
from datetime import date
from typing import List, Optional
import logging
import os

logging.basicConfig(level=logging.INFO)

BASE = Path(os.environ.get("BANK_DATA_PATH", Path(__file__).parent / "bank_data"))
app = FastAPI(title="PHLedger", version="2.0.0", description="Free open-source bookkeeping for AU & CA")
agent = PHLedgerAgent()


def _store() -> TransactionStore:
    return TransactionStore(str(BASE))


# ── Meta ──────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    from db.store import supabase_enabled
    return {"status": "ok", "version": "2.0.0", "backend": "supabase" if supabase_enabled() else "csv",
            "au_banks": AU_BANKS, "ca_banks": CA_BANKS}


@app.get("/ui", response_class=HTMLResponse)
def ui():
    return HTMLResponse(Path(__file__).with_name("ui.html").read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
def root():
    return ui()


@app.get("/readme")
def readme():
    return {"readme": Path(__file__).with_name("README.md").read_text()}


# ── Upload ────────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_csv(bank: str = Form(...), file: UploadFile = File(...)):
    content = (await file.read()).decode("utf-8")
    txs = parse_csv_file(content, bank=bank)
    if not txs:
        return {"error": "Empty file or no valid rows"}, 400
    txs = auto_categorise(txs)
    store = _store()
    if hasattr(store, "upsert"):
        store.upsert(txs)
    else:
        dest = BASE / bank / str(txs[0].date.year) / f"{txs[0].date.month:02d}" / file.filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(content)
    return {"message": f"Uploaded {len(txs)} transactions from {bank}", "bank": bank, "count": len(txs)}


@app.post("/upload-batch")
async def upload_batch(bank: str = Form(...), files: List[UploadFile] = File(...)):
    total = 0
    for file in files:
        content = (await file.read()).decode("utf-8")
        txs = parse_csv_file(content, bank=bank)
        if txs:
            auto_categorise(txs)
            total += len(txs)
    return {"message": f"Uploaded {total} transactions across {len(files)} files", "bank": bank, "total": total}


# ── Transactions ──────────────────────────────────────────────────────────────

@app.get("/transactions", response_model=List[Transaction])
def get_transactions(bank: Optional[str] = None, country: Optional[str] = None, limit: int = 1000):
    store = _store()
    if bank:
        txs = store.load_bank(bank)
    elif country:
        txs = store.load_country(country.upper())
    else:
        txs = store.load_all()
    return txs[:limit]


# ── Analytics ─────────────────────────────────────────────────────────────────

@app.get("/analytics")
def get_analytics(country: Optional[str] = None):
    store = _store()
    if country:
        txs = store.load_country(country.upper())
        banks = AU_BANKS if country.upper() == "AU" else CA_BANKS
    else:
        txs = store.load_all()
        banks = AU_BANKS + CA_BANKS
    income = sum(t.amount for t in txs if t.amount > 0)
    expenses = sum(abs(t.amount) for t in txs if t.amount < 0)
    return {
        "country": country or "ALL",
        "banks_included": banks,
        "total_transactions": len(txs),
        "total_income": round(income, 2),
        "total_expenses": round(expenses, 2),
        "net": round(income - expenses, 2),
    }


# ── Financial Statements ──────────────────────────────────────────────────────

@app.get("/financial-statements")
def get_financial_statements(country: Optional[str] = None, as_of: Optional[str] = None):
    store = _store()
    txs = store.load_country(country.upper()) if country else store.load_all()
    as_of_date = date.fromisoformat(as_of) if as_of else date.today()
    fs = generate_financial_statements(as_of_date, txs)
    banks = (AU_BANKS if country and country.upper() == "AU" else CA_BANKS if country and country.upper() == "CA" else AU_BANKS + CA_BANKS)
    return {**fs.model_dump(), "banks_included": banks}


# ── BAS (AU) ──────────────────────────────────────────────────────────────────

@app.get("/bas")
def get_bas(start: Optional[str] = None, end: Optional[str] = None):
    store = _store()
    txs = store.load_country("AU")
    dates = [tx.date for tx in txs]
    s = date.fromisoformat(start) if start else (min(dates) if dates else date(date.today().year, 7, 1))
    e = date.fromisoformat(end) if end else date.today()
    bas = generate_bas_draft(txs, s, e)
    return {**bas.model_dump(), "banks_included": AU_BANKS}


@app.get("/bas/quarterly")
def get_bas_quarterly(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("AU")
    fy = year or (date.today().year if date.today().month >= 7 else date.today().year - 1)
    return {"fy": f"FY{fy}-{str(fy+1)[2:]}", "quarters": generate_quarterly_bas(txs, fy), "banks_included": AU_BANKS}


# ── GST/HST (CA) ──────────────────────────────────────────────────────────────

@app.get("/gst")
def get_gst(year: Optional[int] = None, quarter: Optional[int] = None):
    store = _store()
    txs = store.load_country("CA")
    y = year or date.today().year
    q = quarter or ((date.today().month - 1) // 3 + 1)
    return {**generate_quarterly_gst(y, q, txs).model_dump(), "banks_included": CA_BANKS}


@app.get("/gst/annual")
def get_gst_annual(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("CA")
    y = year or date.today().year
    return {**generate_annual_hst(y, txs), "banks_included": CA_BANKS}


# ── Tax (AU) ──────────────────────────────────────────────────────────────────

@app.get("/tax/au/company")
def tax_au_company(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("AU")
    return {**draft_au_company_tax(year or date.today().year, txs).model_dump(), "banks_included": AU_BANKS}


@app.get("/tax/au/personal")
def tax_au_personal(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("AU")
    return {**draft_au_personal_tax(year or date.today().year, txs).model_dump(), "banks_included": AU_BANKS}


# ── Tax (CA) ──────────────────────────────────────────────────────────────────

@app.get("/tax/ca/corporate")
def tax_ca_corporate(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("CA")
    return {**draft_ca_corporate_tax(year or date.today().year, txs).model_dump(), "banks_included": CA_BANKS}


@app.get("/tax/ca/personal")
def tax_ca_personal(year: Optional[int] = None):
    store = _store()
    txs = store.load_country("CA")
    return {**draft_ca_personal_tax(year or date.today().year, txs).model_dump(), "banks_included": CA_BANKS}


# ── Migration ──────────────────────────────────────────────────────────────────

@app.post("/migrate")
def run_migration(reset: bool = False):
    import migrate
    txs = migrate.run(str(BASE), reset=reset)
    report_path = migrate.OUTPUT_DIR / "migration_report.json"
    report = {}
    if report_path.exists():
        import json
        report = json.loads(report_path.read_text())
    return {"status": "complete", **report}


@app.get("/migrate/status")
def migration_status():
    import json
    report_path = Path("migration_output/migration_report.json")
    if report_path.exists():
        return json.loads(report_path.read_text())
    return {"status": "not_run"}


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return agent.handle(req.message)
