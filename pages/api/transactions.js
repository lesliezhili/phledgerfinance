import { loadAll, loadBank, loadCountry } from '@/lib/store.js';
import { autoCategorise } from '@/lib/categoriser.js';
export default function handler(req, res) {
  const { bank, country, limit = '1000' } = req.query;
  let txs = bank ? loadBank(bank) : country ? loadCountry(country) : loadAll();
  txs = autoCategorise(txs);
  res.json(txs.slice(0, parseInt(limit)));
}