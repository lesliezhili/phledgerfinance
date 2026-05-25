import pytest
from fastapi.testclient import TestClient
import os


@pytest.fixture(autouse=True)
def patch_bank_dir(tmp_path, anz_csv, rbc_csv, monkeypatch):
    anz = tmp_path / "anz" / "2025" / "07"
    anz.mkdir(parents=True)
    (anz / "tx.csv").write_text(anz_csv)
    rbc = tmp_path / "rbc" / "2025" / "10"
    rbc.mkdir(parents=True)
    (rbc / "tx.csv").write_text(rbc_csv)
    monkeypatch.setenv("BANK_DATA_PATH", str(tmp_path))


@pytest.fixture
def client():
    from main import app
    return TestClient(app)


def test_health(client): assert client.get("/health").status_code == 200
def test_ui(client): assert client.get("/ui").status_code == 200
def test_root(client): assert client.get("/").status_code == 200
def test_readme(client): assert client.get("/readme").status_code == 200
def test_transactions(client): assert client.get("/transactions").status_code == 200
def test_analytics(client): assert client.get("/analytics").status_code == 200
def test_financial_statements(client): assert client.get("/financial-statements").status_code == 200
def test_bas(client): assert client.get("/bas").status_code == 200
def test_bas_quarterly(client): assert client.get("/bas/quarterly").status_code == 200
def test_gst(client): assert client.get("/gst").status_code == 200
def test_gst_annual(client): assert client.get("/gst/annual").status_code == 200
def test_tax_au_company(client): assert client.get("/tax/au/company").status_code == 200
def test_tax_au_personal(client): assert client.get("/tax/au/personal").status_code == 200
def test_tax_ca_corporate(client): assert client.get("/tax/ca/corporate").status_code == 200
def test_tax_ca_personal(client): assert client.get("/tax/ca/personal").status_code == 200
def test_migrate_status(client): assert client.get("/migrate/status").status_code == 200
def test_chat_help(client): assert client.post("/chat", json={"message": "help"}).status_code == 200
