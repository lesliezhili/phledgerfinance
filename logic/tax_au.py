from models import TaxDraftAUCompany, TaxDraftAUPersonal, Transaction
from typing import List


def draft_au_company_tax(year: int, txs: List[Transaction]) -> TaxDraftAUCompany:
    """AU company tax — 25% small business rate (SBD)."""
    income = sum(tx.amount for tx in txs if tx.amount > 0)
    expenses = sum(abs(tx.amount) for tx in txs if tx.amount < 0)
    taxable = max(0.0, income - expenses)
    tax = round(taxable * 0.25, 2)
    return TaxDraftAUCompany(
        year=year, taxable_income=round(taxable, 2), tax_payable=tax,
        notes=["25% small business company tax rate (SBD)", "Base rate entity — turnover < $50M"],
    )


def draft_au_personal_tax(year: int, txs: List[Transaction]) -> TaxDraftAUPersonal:
    """AU personal income tax — 2024-25 Stage 3 brackets + 2% Medicare levy."""
    income = sum(tx.amount for tx in txs if tx.amount > 0)

    # 2024-25 Stage 3 brackets
    if income <= 18_200:
        tax = 0.0
    elif income <= 45_000:
        tax = (income - 18_200) * 0.16
    elif income <= 135_000:
        tax = 4_288 + (income - 45_000) * 0.30
    elif income <= 190_000:
        tax = 31_288 + (income - 135_000) * 0.37
    else:
        tax = 51_638 + (income - 190_000) * 0.45

    medicare = round(income * 0.02, 2)
    return TaxDraftAUPersonal(
        year=year, taxable_income=round(income, 2),
        tax_payable=round(tax, 2), medicare_levy=medicare,
        notes=["2024-25 Stage 3 tax brackets", "2% Medicare levy included"],
    )
