from models import Transaction, ChartOfAccount
from typing import List
import re
import json
from pathlib import Path

DEFAULT_COA = [
    {"code": "200", "name": "Sales Revenue", "type": "INCOME"},
    {"code": "201", "name": "Service Revenue", "type": "INCOME"},
    {"code": "202", "name": "Other Income", "type": "INCOME"},
    {"code": "400", "name": "Office Expenses", "type": "EXPENSE"},
    {"code": "401", "name": "Software Subscriptions", "type": "EXPENSE"},
    {"code": "402", "name": "Travel & Accommodation", "type": "EXPENSE"},
    {"code": "403", "name": "Advertising & Marketing", "type": "EXPENSE"},
    {"code": "404", "name": "Telecommunications", "type": "EXPENSE"},
    {"code": "405", "name": "Accounting & Legal", "type": "EXPENSE"},
    {"code": "406", "name": "Bank Fees", "type": "EXPENSE"},
    {"code": "407", "name": "Meals & Entertainment", "type": "EXPENSE"},
    {"code": "408", "name": "Utilities", "type": "EXPENSE"},
    {"code": "409", "name": "Rent & Lease", "type": "EXPENSE"},
    {"code": "410", "name": "Insurance", "type": "EXPENSE"},
    {"code": "411", "name": "Wages & Salaries", "type": "EXPENSE"},
    {"code": "412", "name": "Contractors", "type": "EXPENSE"},
    {"code": "413", "name": "Superannuation", "type": "EXPENSE"},
    {"code": "414", "name": "Motor Vehicle", "type": "EXPENSE"},
    {"code": "415", "name": "Depreciation", "type": "EXPENSE"},
    {"code": "499", "name": "Uncategorised Expense", "type": "EXPENSE"},
    {"code": "600", "name": "Cash at Bank", "type": "ASSET"},
    {"code": "601", "name": "Accounts Receivable", "type": "ASSET"},
    {"code": "800", "name": "Accounts Payable", "type": "LIABILITY"},
    {"code": "801", "name": "GST Payable", "type": "LIABILITY"},
    {"code": "900", "name": "Retained Earnings", "type": "EQUITY"},
    {"code": "901", "name": "Owner Equity", "type": "EQUITY"},
]

DEFAULT_RULES = [
    {"pattern": r"(?i)uber\s*eats|ubereats", "account_code": "407", "tax_code": "GST"},
    {"pattern": r"(?i)uber|lyft|taxi|cab\b", "account_code": "402", "tax_code": "GST"},
    {"pattern": r"(?i)client|invoice|payment received", "account_code": "200", "tax_code": "GST_ON_INCOME"},
    {"pattern": r"(?i)airbnb|hotel|accommodation|motel", "account_code": "402", "tax_code": "GST"},
    {"pattern": r"(?i)qantas|virgin australia|jetstar|air canada|westjet|flight|airline", "account_code": "402", "tax_code": "GST"},
    {"pattern": r"(?i)netflix|spotify|github|aws|azure|google cloud|atlassian|slack|zoom|dropbox", "account_code": "401", "tax_code": "GST"},
    {"pattern": r"(?i)woolworths|coles|aldi|iga|safeway|metro|loblaws|sobeys|grocery", "account_code": "407", "tax_code": "GST"},
    {"pattern": r"(?i)restaurant|cafe|coffee|mcdonald|kfc|subway|pizza|sushi|bakery|hungry jacks|tim hortons|starbucks", "account_code": "407", "tax_code": "GST"},
    {"pattern": r"(?i)telstra|optus|vodafone|tpg|rogers|bell canada|telus|mobile|internet|broadband", "account_code": "404", "tax_code": "GST"},
    {"pattern": r"(?i)bank fee|monthly fee|account fee|atm fee|overdraft", "account_code": "406", "tax_code": "INPUT"},
    {"pattern": r"(?i)insurance|allianz|nrma|aami|suncorp|sun life|manulife", "account_code": "410", "tax_code": "GST"},
    {"pattern": r"(?i)rent|lease|real estate|property management", "account_code": "409", "tax_code": "GST"},
    {"pattern": r"(?i)salary|payroll|wages|super|superannuation|ato|cra|hst|payg", "account_code": "411", "tax_code": "INPUT"},
    {"pattern": r"(?i)contractor|freelance|consultant", "account_code": "412", "tax_code": "GST"},
    {"pattern": r"(?i)fuel|petrol|bp|shell|ampol|caltex|esso|chevron", "account_code": "414", "tax_code": "GST"},
    {"pattern": r"(?i)power|electricity|water|gas|energy australia|origin energy|agl", "account_code": "408", "tax_code": "GST"},
]

_COA_MAP = {item["code"]: item["name"] for item in DEFAULT_COA}


def load_coa(path: str = "chart_of_accounts.json") -> List[ChartOfAccount]:
    p = Path(path)
    if p.exists():
        data = json.loads(p.read_text())
        return [ChartOfAccount(**item) for item in data]
    return [ChartOfAccount(**item) for item in DEFAULT_COA]


def load_rules(path: str = "classification_rules.json") -> list:
    p = Path(path)
    if p.exists():
        return json.loads(p.read_text())
    return DEFAULT_RULES


def auto_categorise(txs: List[Transaction], rules: list = None) -> List[Transaction]:
    """Apply classification rules. First match wins — Uber Eats rule precedes generic Uber/transport."""
    if rules is None:
        rules = load_rules()
    for tx in txs:
        matched = False
        for rule in rules:
            if re.search(rule["pattern"], tx.description):
                tx.account_code = rule["account_code"]
                tx.tax_code = rule["tax_code"]
                tx.category = _COA_MAP.get(rule["account_code"], "Unknown")
                matched = True
                break
        if not matched:
            if tx.amount > 0:
                tx.account_code = "202"
                tx.tax_code = "GST_ON_INCOME"
                tx.category = "Other Income"
            else:
                tx.account_code = "499"
                tx.tax_code = "GST"
                tx.category = "Uncategorised Expense"
    return txs
