from logic.financial_statements import generate_financial_statements
from datetime import date


class TestFinancialStatements:
    def test_balance_sheet_keys(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        assert "assets" in fs.balance_sheet
        assert "liabilities" in fs.balance_sheet
        assert "equity" in fs.balance_sheet

    def test_profit_loss_keys(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        assert "revenue" in fs.profit_loss
        assert "expenses" in fs.profit_loss
        assert "net_income" in fs.profit_loss

    def test_cash_flow_keys(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        assert "operating" in fs.cash_flow
        assert "investing" in fs.cash_flow
        assert "financing" in fs.cash_flow

    def test_revenue_positive(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        assert fs.profit_loss["revenue"] > 0

    def test_expenses_positive(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        assert fs.profit_loss["expenses"] > 0

    def test_net_income_calculation(self, au_transactions):
        fs = generate_financial_statements(date.today(), au_transactions)
        pl = fs.profit_loss
        assert abs(pl["net_income"] - (pl["revenue"] - pl["expenses"])) < 0.01

    def test_as_of_date_filter(self, au_transactions):
        fs_past = generate_financial_statements(date(2025, 7, 31), au_transactions)
        fs_all = generate_financial_statements(date.today(), au_transactions)
        assert fs_past.profit_loss["revenue"] <= fs_all.profit_loss["revenue"]

    def test_as_of_date_set(self, au_transactions):
        d = date(2025, 9, 30)
        fs = generate_financial_statements(d, au_transactions)
        assert fs.as_of_date == d

    def test_empty_transactions(self):
        fs = generate_financial_statements(date.today(), [])
        assert fs.profit_loss["revenue"] == 0
        assert fs.profit_loss["expenses"] == 0

    def test_ca_transactions(self, ca_transactions):
        fs = generate_financial_statements(date.today(), ca_transactions)
        assert fs.profit_loss["revenue"] > 0
