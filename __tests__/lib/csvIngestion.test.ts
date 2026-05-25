import { detectFormat, parseCsv } from '@/lib/csvIngestion';

describe('detectFormat', () => {
  it('detects ANZ format', () => expect(detectFormat(['Date','Details','Debit','Credit','Balance'])).toBe('anz'));
  it('detects TD format', () => expect(detectFormat(['Date','Description','DEBIT','CREDIT'])).toBe('td'));
  it('detects RBC format', () => expect(detectFormat(['Transaction Date','Description 1','CAD$'])).toBe('rbc'));
  it('detects PHLedger format', () => expect(detectFormat(['date','description','amount','currency'])).toBe('phledger'));
  it('falls back to CBA', () => expect(detectFormat(['Date','Description','Amount'])).toBe('cba'));
});

describe('parseCsv', () => {
  const ANZ_CSV = `Date,Details,Debit,Credit,Balance
15/07/2025,Client Invoice,,5000.00,5000.00
20/07/2025,Woolworths,120.00,,4880.00`;

  const RBC_CSV = `Transaction Date,Description 1,Description 2,CAD$,USD$
01/10/2025,Client Payment,,4000.00,
15/10/2025,Loblaws,,-200.00,`;

  const TD_CSV = `Date,Description,DEBIT,CREDIT
2025-01-10,Client Payment,,4000.00
2025-01-15,Woolworths,200.00,`;

  it('parses ANZ CSV correctly', () => {
    const txs = parseCsv(ANZ_CSV, 'anz');
    expect(txs).toHaveLength(2);
    expect(txs[0].amount).toBe(5000);
    expect(txs[1].amount).toBe(-120);
    expect(txs[0].currency).toBe('AUD');
    expect(txs[0].bank).toBe('anz');
  });

  it('parses RBC CSV correctly', () => {
    const txs = parseCsv(RBC_CSV, 'rbc');
    expect(txs).toHaveLength(2);
    expect(txs[0].amount).toBe(4000);
    expect(txs[1].amount).toBe(-200);
    expect(txs[0].currency).toBe('CAD');
  });

  it('parses TD DEBIT/CREDIT columns', () => {
    const txs = parseCsv(TD_CSV, 'td');
    expect(txs[0].amount).toBe(4000);   // CREDIT
    expect(txs[1].amount).toBe(-200);   // DEBIT
  });

  it('returns [] for empty content', () => expect(parseCsv('', 'anz')).toEqual([]));
  it('returns [] for header-only', () => expect(parseCsv('Date,Details,Debit,Credit,Balance', 'anz')).toEqual([]));
  it('deduplicates by id', () => {
    const txs = parseCsv(ANZ_CSV + '\n' + ANZ_CSV.split('\n').slice(1).join('\n'), 'anz');
    const ids = txs.map(t => t.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
  it('sorts output by date ascending', () => {
    const txs = parseCsv(ANZ_CSV, 'anz');
    const dates = txs.map(t => t.date);
    expect(dates).toEqual([...dates].sort());
  });
});
