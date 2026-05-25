import { loadCountry, AU_BANKS } from '../../../../lib/store.js';
import { autoCategorise } from '../../../../lib/categoriser.js';
import { generateQuarterlyBas } from '../../../../lib/basAu.js';
export default function handler(req, res) {
  const txs = autoCategorise(loadCountry('AU'));
  const now = new Date();
  const fy  = parseInt(req.query.year) || (now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear()-1);
  res.json({ fy: `FY${fy}-${String(fy+1).slice(2)}`, quarters: generateQuarterlyBas(txs, fy), banks_included: AU_BANKS });
}