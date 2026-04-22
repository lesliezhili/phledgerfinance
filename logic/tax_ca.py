from models import TaxDraftCACorporate, TaxDraftCAPersonal, Transaction, QuarterlyGST
from datetime import date

def draft_ca_corporate_tax(year: int, txs: list[Transaction]):
    income = sum(tx.amount for tx in txs if tx.amount > 0)
    expenses = sum(abs(tx.amount) for tx in txs if tx.amount < 0)
    taxable = max(0, income - expenses)
    fed = taxable * 0.09
    prov = taxable * 0.03
    return TaxDraftCACorporate(
        year=year,
        taxable_income=round(taxable, 2),
        federal_tax=round(fed, 2),
        provincial_tax=round(prov, 2),
        total_tax=round(fed + prov, 2),
        notes=["Simplified CA corporate tax"]
    )

def draft_ca_personal_tax(year: int, txs: list[Transaction]):
    income = sum(tx.amount for tx in txs if tx.amount > 0)
    fed = income * 0.15
    prov = income * 0.05
    return TaxDraftCAPersonal(
        year=year,
        taxable_income=round(income, 2),
        federal_tax=round(fed, 2),
        provincial_tax=round(prov, 2),
        total_tax=round(fed + prov, 2),
        notes=["Simplified CA personal tax"]
    )

def generate_quarterly_gst(year: int, quarter: int, txs: list[Transaction]):
    # Assume GST is 5% on sales, and paid on purchases
    sales = sum(tx.amount for tx in txs if tx.amount > 0 and tx.date.year == year and (tx.date.month - 1) // 3 + 1 == quarter)
    purchases = sum(abs(tx.amount) for tx in txs if tx.amount < 0 and tx.date.year == year and (tx.date.month - 1) // 3 + 1 == quarter)
    gst_collected = sales * 0.05
    gst_paid = purchases * 0.05
    net = gst_collected - gst_paid
    return QuarterlyGST(
        quarter=quarter,
        year=year,
        gst_collected=round(gst_collected, 2),
        gst_paid=round(gst_paid, 2),
        net_gst=round(net, 2),
        notes=["Quarterly GST calculation"]
    )
