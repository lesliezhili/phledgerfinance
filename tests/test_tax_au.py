from logic.tax_au import draft_au_company_tax, draft_au_personal_tax
from datetime import date


class TestAUCompanyTax:
    def test_25_percent_rate(self, au_transactions):
        result = draft_au_company_tax(2025, au_transactions)
        net = sum(tx.amount for tx in au_transactions)
        if net > 0:
            assert abs(result.tax_payable - net * 0.25) < 0.01

    def test_zero_if_loss(self, ca_transactions):
        losses = [tx for tx in ca_transactions if tx.amount < 0]
        result = draft_au_company_tax(2025, losses)
        assert result.tax_payable == 0.0

    def test_notes_present(self, au_transactions):
        result = draft_au_company_tax(2025, au_transactions)
        assert len(result.notes) > 0

    def test_year_set(self, au_transactions):
        result = draft_au_company_tax(2025, au_transactions)
        assert result.year == 2025


class TestAUPersonalTax:
    def test_tax_threshold_zero(self):
        from models import Transaction
        low = [Transaction(id="x", date=date(2025, 7, 1), description="income", amount=10000.0, currency="AUD", bank="anz")]
        result = draft_au_personal_tax(2025, low)
        assert result.tax_payable == 0.0

    def test_medicare_levy(self, au_transactions):
        result = draft_au_personal_tax(2025, au_transactions)
        income = sum(tx.amount for tx in au_transactions if tx.amount > 0)
        assert abs(result.medicare_levy - income * 0.02) < 0.01

    def test_stage3_bracket(self):
        from models import Transaction
        high = [Transaction(id="x", date=date(2025, 7, 1), description="income", amount=150000.0, currency="AUD", bank="anz")]
        result = draft_au_personal_tax(2025, high)
        assert result.tax_payable > 0

    def test_notes_present(self, au_transactions):
        result = draft_au_personal_tax(2025, au_transactions)
        assert any("Stage 3" in n for n in result.notes)
