import pytest
from logic.bas_au import generate_bas_draft, generate_quarterly_bas
from datetime import date


class TestGenerateBAS:
    def test_g1_total_sales(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas.g1_total_sales > 0

    def test_g11_purchases(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas.g11_non_capital_purchases > 0

    def test_gst_1a_positive(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas.gst_on_sales_1a > 0

    def test_gst_1b_positive(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas.gst_on_purchases_1b > 0

    def test_net_gst_calculation(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert abs(bas.net_gst_payable - (bas.gst_on_sales_1a - bas.gst_on_purchases_1b)) < 0.01

    def test_period_filter(self, au_transactions):
        bas_narrow = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 7, 31))
        bas_wide = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas_narrow.g1_total_sales <= bas_wide.g1_total_sales

    def test_empty_period(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2020, 1, 1), date(2020, 1, 31))
        assert bas.g1_total_sales == 0
        assert bas.net_gst_payable == 0

    def test_g10_capital_zero(self, au_transactions):
        bas = generate_bas_draft(au_transactions, date(2025, 7, 1), date(2025, 12, 31))
        assert bas.g10_capital_purchases == 0.0


class TestQuarterlyBAS:
    def test_four_quarters(self, au_transactions):
        quarters = generate_quarterly_bas(au_transactions, 2025)
        assert len(quarters) == 4

    def test_quarter_labels(self, au_transactions):
        quarters = generate_quarterly_bas(au_transactions, 2025)
        labels = [q["label"] for q in quarters]
        assert "Jul-Sep" in labels
        assert "Apr-Jun" in labels

    def test_quarter_numbers(self, au_transactions):
        quarters = generate_quarterly_bas(au_transactions, 2025)
        assert [q["quarter"] for q in quarters] == [1, 2, 3, 4]

    def test_fy_label(self, au_transactions):
        quarters = generate_quarterly_bas(au_transactions, 2025)
        assert all(q["fy"] == "FY2025-26" for q in quarters)

    def test_period_dates(self, au_transactions):
        quarters = generate_quarterly_bas(au_transactions, 2025)
        assert quarters[0]["period_start"] == "2025-07-01"
        assert quarters[0]["period_end"] == "2025-09-30"
