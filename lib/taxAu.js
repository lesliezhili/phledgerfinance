// lib/taxAu.js
export function draftAuCompanyTax(year, transactions) {
  const income   = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
  const taxable  = Math.max(0, income - expenses);
  return {
    year, taxable_income: r(taxable), tax_payable: r(taxable * 0.25),
    notes: ['25% small business company tax rate (SBD)', 'Base rate entity — turnover < $50M'],
  };
}

export function draftAuPersonalTax(year, transactions) {
  const income = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  let tax = 0;
  if      (income <= 18200)  tax = 0;
  else if (income <= 45000)  tax = (income - 18200) * 0.16;
  else if (income <= 135000) tax = 4288 + (income - 45000) * 0.30;
  else if (income <= 190000) tax = 31288 + (income - 135000) * 0.37;
  else                       tax = 51638 + (income - 190000) * 0.45;
  return {
    year, taxable_income: r(income), tax_payable: r(tax), medicare_levy: r(income * 0.02),
    notes: ['2024-25 Stage 3 brackets', '2% Medicare levy included'],
  };
}

function r(n) { return Math.round(n * 100) / 100; }
