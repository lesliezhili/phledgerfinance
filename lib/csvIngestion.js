// lib/csvIngestion.js
import crypto from 'crypto';

const AU_BANKS = new Set(['anz','nab','cba','westpac']);
const CA_BANKS = new Set(['rbc','td','bmo','scotiabank','cibc']);

export function detectFormat(headers) {
  const h = new Set(headers.map(s => s.trim()));
  if (h.has('Transaction Date') && h.has('CAD$')) return 'rbc';
  if (h.has('DEBIT') && h.has('CREDIT') && h.has('Date')) return 'td';
  if (h.has('Details') && h.has('Debit') && h.has('Credit')) return 'anz';
  if (h.has('date') && h.has('description') && h.has('amount')) return 'phledger';
  return 'cba';
}

const FORMATS = {
  phledger: { date:'date', desc:'description', amount:'amount', datefmt:'iso' },
  anz:      { date:'Date', desc:'Details', debit:'Debit', credit:'Credit', datefmt:'dmy_slash' },
  nab:      { date:'Date', desc:'Description', amount:'Amount', datefmt:'dmy_dash' },
  cba:      { date:'Date', desc:'Description', amount:'Amount', datefmt:'dmy_slash' },
  westpac:  { date:'Date', desc:'Description', amount:'Amount', datefmt:'dmy_slash' },
  rbc:      { date:'Transaction Date', desc:'Description 1', amount:'CAD$', datefmt:'mdy_slash' },
  td:       { date:'Date', desc:'Description', debit:'DEBIT', credit:'CREDIT', datefmt:'mdy_slash' },
  bmo:      { date:'Date', desc:'Description', amount:'Amount', datefmt:'iso' },
  scotiabank:{ date:'Date', desc:'Description', amount:'Amount', datefmt:'mdy_slash' },
  cibc:     { date:'Date', desc:'Description', amount:'Debit/Credit', datefmt:'iso' },
};

function parseDate(s, fmt) {
  if (!s) return null;
  s = s.trim();
  try {
    if (fmt === 'iso') return new Date(s).toISOString().slice(0,10);
    if (fmt === 'dmy_slash') { const [d,m,y]=s.split('/'); return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`; }
    if (fmt === 'dmy_dash')  { const [d,m,y]=s.split('-'); return new Date(`${d} ${m} ${y}`).toISOString().slice(0,10); }
    if (fmt === 'mdy_slash') { const [m,d,y]=s.split('/'); return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`; }
  } catch { return null; }
  return null;
}

function parseAmount(v) {
  if (!v || !String(v).trim()) return 0;
  const n = parseFloat(String(v).replace(/,/g,'').replace(/\$/g,'').trim());
  return isNaN(n) ? 0 : n;
}

function makeId(bank, date, desc, amount) {
  return crypto.createHash('md5').update(`${bank}|${date}|${desc}|${amount}`).digest('hex').slice(0,16);
}

export function parseCsv(content, bank = 'phledger') {
  const lines = content.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g,'').trim());
  const fmt_key = detectFormat(headers);
  const fmt = FORMATS[fmt_key] || FORMATS.phledger;
  const bank_l = bank.toLowerCase();
  const currency = AU_BANKS.has(bank_l) ? 'AUD' : CA_BANKS.has(bank_l) ? 'CAD' : 'AUD';

  const txs = [];
  const seen = new Set();

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = lines[i].split(',').map(c => c.replace(/"/g,'').trim());
      const row = Object.fromEntries(headers.map((h,idx) => [h, cols[idx] || '']));

      const dateStr = parseDate(row[fmt.date], fmt.datefmt);
      if (!dateStr) continue;

      const description = (row[fmt.desc] || '').trim();
      let amount;
      if (fmt.debit && fmt.credit) {
        const d = parseAmount(row[fmt.debit]);
        const c = parseAmount(row[fmt.credit]);
        amount = c - d;
      } else {
        amount = parseAmount(row[fmt.amount] || row['amount'] || '0');
      }
      if (amount === 0 && !description) continue;

      const id = makeId(bank_l, dateStr, description, String(amount));
      if (seen.has(id)) continue;
      seen.add(id);

      txs.push({ id, date: dateStr, description, amount, currency, bank: bank_l });
    } catch { continue; }
  }
  return txs.sort((a,b) => a.date.localeCompare(b.date));
}
