from models import FinancialStatements, Transaction
from datetime import date
from typing import List

def generate_financial_statements(as_of: date, txs: List[Transaction]) -> FinancialStatements:
    # Simple balance sheet: assets = cash (assume starting cash + txs), liabilities = 0, equity = retained earnings
    cash = 10000  # Assume starting cash
    for tx in txs:
        if tx.date <= as_of:
            cash += tx.amount

    retained_earnings = cash - 10000  # Simplified

    balance_sheet = {
        "assets": {"cash": round(cash, 2)},
        "liabilities": {},
        "equity": {"retained_earnings": round(retained_earnings, 2)}
    }

    # P&L: revenue - expenses
    revenue = sum(tx.amount for tx in txs if tx.amount > 0 and tx.date <= as_of)
    expenses = sum(abs(tx.amount) for tx in txs if tx.amount < 0 and tx.date <= as_of)
    net_income = revenue - expenses

    profit_loss = {
        "revenue": round(revenue, 2),
        "expenses": round(expenses, 2),
        "net_income": round(net_income, 2)
    }

    # Cash flow: simplified as net income
    cash_flow = {
        "operating": round(net_income, 2),
        "investing": 0,
        "financing": 0,
        "net_change": round(net_income, 2)
    }

    return FinancialStatements(
        as_of_date=as_of,
        balance_sheet=balance_sheet,
        profit_loss=profit_loss,
        cash_flow=cash_flow
    )