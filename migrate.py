"""PHLedger migration: ingest all historical CSVs, seed config, write summaries."""
import csv
import json
from pathlib import Path
from typing import List
from connectors.csv_ingestion import CSVIngestionManager
from logic.categoriser import DEFAULT_COA, DEFAULT_RULES, auto_categorise
from logic.bas_au import generate_bas_draft
from models import Transaction
from datetime import date as Date

OUTPUT_DIR = Path("migration_output")


def ingest_all(base_dir: str = "bank_data") -> List[Transaction]:
    txs = CSVIngestionManager(base_dir).load_all()
    return auto_categorise(txs)


def write_ledger(txs: List[Transaction], out: Path = OUTPUT_DIR / "historical_ledger.csv"):
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "date", "description", "amount", "currency", "bank", "account_code", "tax_code", "category"])
        for tx in txs:
            w.writerow([tx.id, tx.date, tx.description, tx.amount, tx.currency, tx.bank, tx.account_code, tx.tax_code, tx.category])


def write_monthly(txs: List[Transaction], out: Path = OUTPUT_DIR / "monthly_summary.csv"):
    monthly: dict = {}
    for tx in txs:
        key = (tx.date.year, tx.date.month, tx.currency)
        monthly.setdefault(key, {"income": 0.0, "expenses": 0.0})
        if tx.amount > 0:
            monthly[key]["income"] += tx.amount
        else:
            monthly[key]["expenses"] += abs(tx.amount)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["year", "month", "currency", "income", "expenses", "net"])
        for (yr, mo, cur), v in sorted(monthly.items()):
            w.writerow([yr, mo, cur, round(v["income"], 2), round(v["expenses"], 2), round(v["income"] - v["expenses"], 2)])


def write_yearly(txs: List[Transaction], out: Path = OUTPUT_DIR / "yearly_summary.csv"):
    yearly: dict = {}
    for tx in txs:
        fy = tx.date.year if tx.date.month >= 7 else tx.date.year - 1
        key = (f"FY{fy}-{str(fy + 1)[2:]}", tx.currency)
        yearly.setdefault(key, {"income": 0.0, "expenses": 0.0})
        if tx.amount > 0:
            yearly[key]["income"] += tx.amount
        else:
            yearly[key]["expenses"] += abs(tx.amount)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["fy", "currency", "income", "expenses", "net"])
        for (fy, cur), v in sorted(yearly.items()):
            w.writerow([fy, cur, round(v["income"], 2), round(v["expenses"], 2), round(v["income"] - v["expenses"], 2)])


def write_categories(txs: List[Transaction], out: Path = OUTPUT_DIR / "category_summary.csv"):
    cats: dict = {}
    for tx in txs:
        key = (tx.category or "Uncategorised", tx.currency)
        cats[key] = cats.get(key, 0.0) + tx.amount
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["category", "currency", "total"])
        for (cat, cur), total in sorted(cats.items()):
            w.writerow([cat, cur, round(total, 2)])


def write_bas_history(txs: List[Transaction], out: Path = OUTPUT_DIR / "bas_history.csv"):
    au_txs = [tx for tx in txs if tx.currency == "AUD"]
    if not au_txs:
        return
    min_date, max_date = min(tx.date for tx in au_txs), max(tx.date for tx in au_txs)

    def qd(fy, q):
        if q == 1: return Date(fy, 7, 1), Date(fy, 9, 30)
        if q == 2: return Date(fy, 10, 1), Date(fy, 12, 31)
        if q == 3: return Date(fy + 1, 1, 1), Date(fy + 1, 3, 31)
        return Date(fy + 1, 4, 1), Date(fy + 1, 6, 30)

    fy_start = min_date.year if min_date.month >= 7 else min_date.year - 1
    fy_end = max_date.year if max_date.month >= 7 else max_date.year - 1
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["period", "start", "end", "g1_sales", "g11_purchases", "gst_1a", "gst_1b", "net_gst"])
        for fy in range(fy_start, fy_end + 1):
            for q in range(1, 5):
                s, e = qd(fy, q)
                if e < min_date or s > max_date:
                    continue
                bas = generate_bas_draft(au_txs, s, e)
                w.writerow([f"FY{fy}-{str(fy+1)[2:]} Q{q}", s, e, bas.g1_total_sales, bas.g11_non_capital_purchases, bas.gst_on_sales_1a, bas.gst_on_purchases_1b, bas.net_gst_payable])


def write_report(txs: List[Transaction], out: Path = OUTPUT_DIR / "migration_report.json"):
    from collections import Counter
    report = {
        "total_transactions": len(txs),
        "date_range": {"from": str(min(tx.date for tx in txs)) if txs else None, "to": str(max(tx.date for tx in txs)) if txs else None},
        "by_bank": dict(Counter(tx.bank for tx in txs)),
        "by_currency": dict(Counter(tx.currency for tx in txs)),
        "total_income_aud": round(sum(tx.amount for tx in txs if tx.amount > 0 and tx.currency == "AUD"), 2),
        "total_expenses_aud": round(sum(abs(tx.amount) for tx in txs if tx.amount < 0 and tx.currency == "AUD"), 2),
        "total_income_cad": round(sum(tx.amount for tx in txs if tx.amount > 0 and tx.currency == "CAD"), 2),
        "total_expenses_cad": round(sum(abs(tx.amount) for tx in txs if tx.amount < 0 and tx.currency == "CAD"), 2),
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2))


def seed_config():
    for path, data in [("chart_of_accounts.json", DEFAULT_COA), ("classification_rules.json", DEFAULT_RULES)]:
        p = Path(path)
        if not p.exists():
            p.write_text(json.dumps(data, indent=2))
            print(f"Seeded {p}")


def run(base_dir: str = "bank_data", reset: bool = False):
    if reset and OUTPUT_DIR.exists():
        import shutil
        shutil.rmtree(OUTPUT_DIR)
    seed_config()
    print("Ingesting transactions...")
    txs = ingest_all(base_dir)
    print(f"  {len(txs)} transactions")
    if txs:
        write_ledger(txs)
        write_monthly(txs)
        write_yearly(txs)
        write_categories(txs)
        write_bas_history(txs)
    write_report(txs)
    print(f"Done. Outputs in {OUTPUT_DIR}/")
    return txs


if __name__ == "__main__":
    run()
