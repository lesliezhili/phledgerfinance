"""Unified transaction store: CSV backend (default) or Supabase (when env vars set)."""
import os
from typing import List, Optional
from models import Transaction
from connectors.csv_ingestion import CSVIngestionManager

AU_BANKS = ["anz", "nab", "cba", "westpac"]
CA_BANKS = ["rbc", "td", "bmo", "scotiabank", "cibc"]
COUNTRY_BANKS = {"AU": AU_BANKS, "CA": CA_BANKS}
BANK_COUNTRY = {b: "AU" for b in AU_BANKS}
BANK_COUNTRY.update({b: "CA" for b in CA_BANKS})
COUNTRY_CURRENCY = {"AU": "AUD", "CA": "CAD"}
BATCH_SIZE = 500


def country_of(bank: str) -> str:
    return BANK_COUNTRY.get(bank.lower(), "AU")


def supabase_enabled() -> bool:
    return bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"))


class TransactionStore:
    def __init__(self, base_dir: str = "bank_data"):
        self.base_dir = base_dir
        self._ingestor = CSVIngestionManager(base_dir)
        self._supabase = None
        if supabase_enabled():
            from supabase import create_client
            self._supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

    def load_bank(self, bank: str) -> List[Transaction]:
        if self._supabase:
            return self.fetch(bank=bank)
        return self._ingestor.load_bank(bank)

    def load_country(self, country: str) -> List[Transaction]:
        banks = COUNTRY_BANKS.get(country.upper(), [])
        all_txs: dict = {}
        for bank in banks:
            for tx in self.load_bank(bank):
                all_txs[tx.id] = tx
        return sorted(all_txs.values(), key=lambda t: t.date)

    def load_all(self) -> List[Transaction]:
        if self._supabase:
            return self.fetch()
        return self._ingestor.load_all()

    def upsert(self, txs: List[Transaction]) -> int:
        if not self._supabase:
            return 0
        count = 0
        for i in range(0, len(txs), BATCH_SIZE):
            batch = txs[i:i + BATCH_SIZE]
            data = []
            for tx in batch:
                row = tx.model_dump()
                row["date"] = str(row["date"])
                data.append(row)
            self._supabase.table("transactions").upsert(data).execute()
            count += len(batch)
        return count

    def fetch(self, bank: Optional[str] = None, country: Optional[str] = None, limit: int = 10000) -> List[Transaction]:
        if not self._supabase:
            return []
        query = self._supabase.table("transactions").select("*")
        if bank:
            query = query.eq("bank", bank.lower())
        elif country:
            currency = COUNTRY_CURRENCY.get(country.upper())
            if currency:
                query = query.eq("currency", currency)
        result = query.limit(limit).execute()
        txs = []
        for row in result.data:
            from datetime import date
            if isinstance(row["date"], str):
                row["date"] = date.fromisoformat(row["date"])
            txs.append(Transaction(**row))
        return sorted(txs, key=lambda t: t.date)

    def log_migration(self, stats: dict):
        if not self._supabase:
            return
        self._supabase.table("migration_log").insert(stats).execute()
