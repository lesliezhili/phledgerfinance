from models import TaxDraftCACorporate, TaxDraftCAPersonal, QuarterlyGST, Transaction
from typing import List
from datetime import date


def draft_ca_corporate_tax(year: int, txs: List[Transaction]) -> TaxDraftCACorporate:
    """CA corporate tax — 9% federal SBD + 8% avg provincial."""
    income = sum(tx.amount for tx in txs if tx.amount > 0)
    expenses = sum(abs(tx.amount) for tx in txs if tx.amount < 0)
    taxable = max(0.0, income - expenses)
    fed = round(taxable * 0.09, 2)
    prov = round(taxable * 0.08, 2)
    return TaxDraftCACorporate(
        year=year, taxable_income=round(taxable, 2),
        federal_tax=fed, provincial_tax=prov, total_tax=round(fed + prov, 2),
        notes=["9% federal SBD rate", "~8% average provincial rate", "Active business income < $500K"],
    )


def draft_ca_personal_tax(year: int, txs: List[Transaction]) -> TaxDraftCAPersonal:
    """CA personal tax — 2024 federal brackets + BPA credit + avg provincial."""
    income = sum(tx.amount for tx in txs if tx.amount > 0)

    # 2024 federal brackets
    if income <= 55_867:
        fed = income * 0.15
    elif income <= 111_733:
        fed = 8_380.05 + (income - 55_867) * 0.205
    elif income <= 154_906:
        fed = 19_822.36 + (income - 111_733) * 0.26
    elif income <= 220_000:
        fed = 31_047.72 + (income - 154_906) * 0.29
    else:
        fed = 49_929.43 + (income - 220_000) * 0.33

    bpa_credit = 15_705 * 0.15  # Basic Personal Amount credit
    fed = max(0.0, fed - bpa_credit)
    prov = round(income * 0.09, 2)  # avg provincial ~9%
    return TaxDraftCAPersonal(
        year=year, taxable_income=round(income, 2),
        federal_tax=round(fed, 2), provincial_tax=prov, total_tax=round(fed + prov, 2),
        notes=["2024 federal brackets", "Basic Personal Amount credit applied", "~9% average provincial rate"],
    )


def generate_quarterly_gst(year: int, quarter: int, txs: List[Transaction]) -> QuarterlyGST:
    """CA GST quarterly report — 5% GST (divisor 21 for GST-inclusive amounts)."""
    q_txs = [tx for tx in txs if tx.date.year == year and (tx.date.month - 1) // 3 + 1 == quarter]
    sales = sum(tx.amount for tx in q_txs if tx.amount > 0)
    purchases = sum(abs(tx.amount) for tx in q_txs if tx.amount < 0)
    gst_collected = round(sales * 5 / 21, 2)  # extract GST from inclusive amount
    gst_paid = round(purchases * 5 / 21, 2)
    return QuarterlyGST(
        quarter=quarter, year=year,
        gst_collected=gst_collected, gst_paid=gst_paid,
        net_gst=round(gst_collected - gst_paid, 2),
        notes=["5% GST rate", "GST extracted using divisor 21"],
    )


def generate_annual_hst(year: int, txs: List[Transaction]) -> dict:
    """CA annual HST summary — 4 quarters + annual totals."""
    quarters = [generate_quarterly_gst(year, q, txs) for q in range(1, 5)]
    annual_collected = round(sum(q.gst_collected for q in quarters), 2)
    annual_paid = round(sum(q.gst_paid for q in quarters), 2)
    return {
        "year": year,
        "quarters": [q.model_dump() for q in quarters],
        "annual_gst_collected": annual_collected,
        "annual_gst_paid": annual_paid,
        "annual_net_gst": round(annual_collected - annual_paid, 2),
        "hst_provincial_note": "HST rates vary: ON=15%, BC=12%, NS/NB/NL/PEI=15%. Consult CRA for provincial HST.",
    }
