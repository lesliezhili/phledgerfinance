import { draftAuCompanyTax, draftAuPersonalTax } from '@/lib/taxAu';
import type { Transaction } from '@/types/index';

const txs = (income: number, expenses: number): Transaction[] => [
  { id: 'a', date: '2025-07-01', description: 'Income', amount: income, currency: 'AUD', bank: 'anz' },
  { id: 'b', date: '2025-07-02', description: 'Expense', amount: -expenses, currency: 'AUD', bank: 'anz' },
];

describe('draftAuCompanyTax', () => {
  it('applies 25% rate on taxable income', () => {
    const r = draftAuCompanyTax(2025, txs(100_000, 40_000));
    expect(r.taxable_income).toBe(60_000);
    expect(r.tax_payable).toBe(15_000);
  });

  it('returns zero tax on a loss', () => {
    const r = draftAuCompanyTax(2025, txs(10_000, 50_000));
    expect(r.tax_payable).toBe(0);
  });

  it('sets the year', () => expect(draftAuCompanyTax(2026, []).year).toBe(2026));

  it('includes notes', () => expect(draftAuCompanyTax(2025, []).notes.length).toBeGreaterThan(0));
});

describe('draftAuPersonalTax', () => {
  it('returns zero tax under $18,200 threshold', () => {
    const r = draftAuPersonalTax(2025, [{ id:'x', date:'2025-01-01', description:'', amount: 15_000, currency:'AUD', bank:'anz' }]);
    expect(r.tax_payable).toBe(0);
  });

  it('calculates Medicare levy at 2% of income', () => {
    const r = draftAuPersonalTax(2025, [{ id:'x', date:'2025-01-01', description:'', amount: 80_000, currency:'AUD', bank:'anz' }]);
    expect(r.medicare_levy).toBeCloseTo(1600, 0);
  });

  it('includes Stage 3 in notes', () => {
    const r = draftAuPersonalTax(2025, []);
    expect(r.notes.some(n => n.includes('Stage 3'))).toBe(true);
  });
});
