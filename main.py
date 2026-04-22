from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from models import ChatRequest, ChatResponse, Transaction
from chat_agent import PHLedgerAgent
from connectors.bank_downloader import BankDownloader
from logic.financial_statements import generate_financial_statements
from pathlib import Path
import csv
from datetime import datetime, timedelta
from typing import List
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="PHLedger Working Agent")
agent = PHLedgerAgent()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/readme")
def readme():
    return {"readme": Path(__file__).with_name("README.md").read_text()}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return agent.handle(req.message)

@app.get("/ui", response_class=HTMLResponse)
def ui():
    html = Path(__file__).with_name("ui.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)

@app.post("/upload")
def upload_csv(bank: str = Form(...), file: UploadFile = File(...)):
    """
    Upload CSV for ANZ or RBC, auto-detect year/month from dates, save to folder.
    """
    content = file.file.read().decode("utf-8")
    lines = content.splitlines()
    if not lines:
        return {"error": "Empty file"}

    reader = csv.DictReader(lines)
    rows = list(reader)
    if not rows:
        return {"error": "No data rows"}

    # Detect year/month from first row's date
    first_date = datetime.strptime(rows[0]["date"], "%Y-%m-%d").date()
    year = str(first_date.year)
    month = f"{first_date.month:02d}"

    # Folder
    base = Path(__file__).parent / "bank_data" / bank / year / month
    base.mkdir(parents=True, exist_ok=True)

    # Save CSV
    csv_path = base / f"{file.filename}"
    with csv_path.open("w") as f:
        f.write(content)

    return {"message": f"Uploaded {file.filename} to {bank}/{year}/{month}"}

@app.get("/transactions", response_model=List[Transaction])
def get_transactions():
    """
    Get all transactions from ANZ and RBC.
    """
    anz = agent.ingestor.load_bank("anz")
    rbc = agent.ingestor.load_bank("rbc")
    return anz + rbc

@app.get("/analytics")
def get_analytics():
    """
    Get basic analytics on transactions.
    """
    anz = agent.ingestor.load_bank("anz")
    rbc = agent.ingestor.load_bank("rbc")
    all_tx = anz + rbc
    income = sum(t.amount for t in all_tx if t.amount > 0)
    expenses = sum(abs(t.amount) for t in all_tx if t.amount < 0)
    return {
        "total_transactions": len(all_tx),
        "total_income": round(income, 2),
        "total_expenses": round(expenses, 2),
        "net": round(income - expenses, 2)
    }

@app.get("/financial-statements")
def get_financial_statements():
    """
    Get real-time financial statements.
    """
    from datetime import date
    anz = agent.ingestor.load_bank("anz")
    rbc = agent.ingestor.load_bank("rbc")
    all_tx = anz + rbc
    fs = generate_financial_statements(date.today(), all_tx)
    return fs.model_dump()

@app.post("/download-bank")
def download_bank_csv(bank: str = Form(...), days: int = Form(30)):
    """
    Automatically download bank CSV from ANZ or RBC.
    
    Requires environment variables:
    - ANZ_USERNAME, ANZ_PASSWORD (for ANZ)
    - RBC_USERNAME, RBC_PASSWORD (for RBC)
    
    Args:
        bank: "anz" or "rbc"
        days: Number of days back to download (default 30)
    
    WARNING: Requires valid credentials. Use at your own risk.
    """
    try:
        downloader = BankDownloader(bank)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Download to temporary folder
        download_dir = Path(__file__).parent / "bank_downloads" / bank
        downloader.download_csv(start_date, end_date, download_dir)
        
        return {
            "status": "success",
            "bank": bank,
            "message": f"Downloaded {bank.upper()} transactions for last {days} days",
            "download_dir": str(download_dir)
        }
    except Exception as e:
        return {
            "status": "error",
            "bank": bank,
            "error": str(e),
            "message": "Failed to download. Ensure credentials are set as environment variables."
        }
