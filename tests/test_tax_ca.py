from logic.tax_ca import draft_ca_corporate_tax, draft_ca_personal_tax, generate_quarterly_gst, generate_annual_hst
from datetime import date


class TestCACorporateTax:
    def test_9_percent_federal(self, ca_transactions):
        result = draft_ca_corporate_tax(2025, ca_transactions)
        net = max(0, sum(tx.amount for tx in ca_transactions))
        assert abs(result.federal_tax - net * 0.09) < 0.01

    def test_provincial_tax(self, ca_transactions):
        result = draft_ca_corporate_tax(2025, ca_transactions)
        assert result.provincial_tax >= 0

    def test_total_is_sum(self, ca_transactions):
        result = draft_ca_corporate_tax(2025, ca_transactions)
        assert abs(result.total_tax - (result.federal_tax + result.provincial_tax)) < 0.01

    def test_zero_on_loss(self):
        from models import Transaction
        losses = [Transaction(id="x", date=date(2025, 1, 1), description="expense", amount=-5000.0, currency="CAD", bank="rbc")]
        result = draft_ca_corporate_tax(2025, losses)
        assert result.total_tax == 0.0


class TestCAPersonalTax:
    def test_bpa_credit_applied(self):
        from models import Transaction
        txs = [Transaction(id="x", date=date(2025, 1, 1), description="income", amount=50000.0, currency="CAD", bank="rbc")]
        result = draft_ca_personal_tax(2025, txs)
        raw = 50000 * 0.15
        assert result.federal_tax < raw

    def test_total_is_sum(self, ca_transactions):
        result = draft_ca_personal_tax(2025, ca_transactions)
        assert abs(result.total_tax - (result.federal_tax + result.provincial_tax)) < 0.01

    def test_notes_present(self, ca_transactions):
        result = draft_ca_personal_tax(2025, ca_transactions)
        assert len(result.notes) > 0


class TestCAQuarterlyGST:
    def test_divisor_21(self, ca_transactions):
        result = generate_quarterly_gst(2025, 1, ca_transactions)
        sales = sum(tx.amount for tx in ca_transactions if tx.amount > 0 and tx.date.month <= 3)
        expected = round(sales * 5 / 21, 2)
        assert result.gst_collected == expected

    def test_net_gst(self, ca_transactions):
        result = generate_quarterly_gst(2025, 1, ca_transactions)
        assert abs(result.net_gst - (result.gst_collected - result.gst_paid)) < 0.01

    def test_quarter_set(self, ca_transactions):
        result = generate_quarterly_gst(2025, 2, ca_transactions)
        assert result.quarter == 2


class TestCAnnualHST:
    def test_four_quarters(self, ca_transactions):
        result = generate_annual_hst(2025, ca_transactions)
        assert len(result["quarters"]) == 4

    def test_annual_totals_sum(self, ca_transactions):
        result = generate_annual_hst(2025, ca_transactions)
        q_collected = sum(q["gst_collected"] for q in result["quarters"])
        assert abs(result["annual_gst_collected"] - q_collected) < 0.01

    def test_hst_note_present(self, ca_transactions):
        result = generate_annual_hst(2025, ca_transactions)
        assert "hst_provincial_note" in result
