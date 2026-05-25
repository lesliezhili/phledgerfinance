// lib/financialStatements.js
export function generateFinancialStatements(asOf, transactions) {
  const filtered = transactions.filter(t => t.date <= asOf);
  const revenue  = filtered.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
  const net      = revenue - expenses;
  const cash     = 10000 + net;
  return {
    as_of_date: asOf,
    balance_sheet: {
      assets: { cash: r(cash) },
      liabilities: {},
      equity: { retained_earnings: r(net) },
    },
    profit_loss: { revenue: r(revenue), expenses: r(expenses), net_income: r(net) },
    cash_flow: { operating: r(net), investing: 0, financing: 0, net_change: r(net) },
  };
}

function r(n) { return Math.round(n * 100) / 100; }
