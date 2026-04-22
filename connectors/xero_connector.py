from datetime import date, timedelta
from typing import List, Optional
import os
from xero_python.api_client import ApiClient
from xero_python.api_client.configuration import Configuration
from xero_python.accounting import AccountingApi
from xero_python.accounting.models import Account, BankTransaction
from models import Transaction, ChartOfAccount

class XeroConnector:
    def __init__(self):
        self.client_id = os.getenv("XERO_CLIENT_ID")
        self.client_secret = os.getenv("XERO_CLIENT_SECRET")
        self.access_token = os.getenv("XERO_ACCESS_TOKEN")
        self.tenant_id = os.getenv("XERO_TENANT_ID")

        self.available = all([self.client_id, self.client_secret, self.access_token, self.tenant_id])
        if self.available:
            configuration = Configuration()
            configuration.access_token = self.access_token
            self.api_client = ApiClient(configuration)
            self.accounting_api = AccountingApi(self.api_client)
        else:
            print("Xero credentials not set. Xero integration disabled.")

    def get_chart_of_accounts(self) -> List[ChartOfAccount]:
        if not self.available:
            return []
        try:
            accounts = self.accounting_api.get_accounts(self.tenant_id)
            return [
                ChartOfAccount(
                    code=acc.code or str(acc.account_id),
                    name=acc.name,
                    type=acc.type.value if hasattr(acc.type, 'value') else str(acc.type)
                )
                for acc in accounts.accounts
            ]
        except Exception as e:
            print(f"Error fetching chart of accounts: {e}")
            return []

    def get_transactions(self, start: date, end: date) -> List[Transaction]:
        if not self.available:
            return []
        try:
            # Fetch bank transactions (assuming ANZ is a bank account)
            bank_transactions = self.accounting_api.get_bank_transactions(
                self.tenant_id,
                where=f"Date >= DateTime({start.year},{start.month},{start.day}) AND Date <= DateTime({end.year},{end.month},{end.day})"
            )
            txs = []
            for bt in bank_transactions.bank_transactions:
                txs.append(Transaction(
                    id=str(bt.bank_transaction_id),
                    date=bt.date,
                    description=bt.reference or "Bank Transaction",
                    amount=float(bt.amount),
                    currency=bt.currency_code or "AUD"
                ))
            return txs
        except Exception as e:
            print(f"Error fetching transactions: {e}")
            return []
