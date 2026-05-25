from datetime import date
from typing import List
from models import Transaction, BASDraft


def generate_bas_draft(txs: List[Transaction], start: date, end: date) -> BASDraft:
    gst_rate = 0.10
    sales = purchases = gst_sales = gst_purchases = 0.0
    for tx in txs:
        if not (start <= tx.date <= end):
            continue
        if tx.amount > 0:
            sales += tx.amount
            if tx.tax_code not in ("INPUT", "EXEMPT", "GST_FREE"):
                gst_sales += tx.amount * gst_rate / (1 + gst_rate)
        else:
            purchases += abs(tx.amount)
            if tx.tax_code not in ("INPUT", "EXEMPT", "GST_FREE"):
                gst_purchases += abs(tx.amount) * gst_rate / (1 + gst_rate)
    return BASDraft(
        period_start=start, period_end=end,
        g1_total_sales=round(sales, 2),
        g10_capital_purchases=0.0,
        g11_non_capital_purchases=round(purchases, 2),
        gst_on_sales_1a=round(gst_sales, 2),
        gst_on_purchases_1b=round(gst_purchases, 2),
        net_gst_payable=round(gst_sales - gst_purchases, 2),
    )


def generate_quarterly_bas(txs: List[Transaction], year: int) -> List[dict]:
    """Generate 4 ATO BAS quarters for an AU financial year (Jul-Jun)."""
    quarters = [
        (1, "Jul-Sep", date(year, 7, 1), date(year, 9, 30)),
        (2, "Oct-Dec", date(year, 10, 1), date(year, 12, 31)),
        (3, "Jan-Mar", date(year + 1, 1, 1), date(year + 1, 3, 31)),
        (4, "Apr-Jun", date(year + 1, 4, 1), date(year + 1, 6, 30)),
    ]
    result = []
    for q_num, label, start, end in quarters:
        bas = generate_bas_draft(txs, start, end)
        result.append({
            "quarter": q_num,
            "label": label,
            "fy": f"FY{year}-{str(year + 1)[2:]}",
            "period_start": str(start),
            "period_end": str(end),
            **bas.model_dump(),
        })
    return result
