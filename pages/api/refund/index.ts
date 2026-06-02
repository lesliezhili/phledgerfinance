import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/refund — Execute refund via PayTo NPP push-back
 * 
 * Body: { bookingId, amount, reason, customerName, customerBsb?, customerAccount?, testMode? }
 * 
 * In PayTo mode, refund = push payment to customer's bank account (instant via NPP).
 * Cost: $0.00 (no fees for PayTo credits)
 * 
 * PHLedger is FREE exclusively for PHLedger & SilverConnect.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId, amount, reason, customerName, customerBsb, customerAccount, testMode = true } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: "bookingId and amount required" });
  }

  const refundId = "REF-" + Date.now() + "-" + bookingId.slice(0, 8);
  const nppTransactionId = "NPP-REF-" + Date.now();

  // In production: initiate PayTo push credit to customer
  // PayTo supports instant credit push to any Australian bank account via NPP
  const refund = {
    refundId,
    bookingId,
    amount: parseFloat(amount),
    currency: "AUD",
    reason: reason || "customer_refund",
    method: "PayTo NPP Credit Push",
    nppTransactionId,
    status: testMode ? "simulated" : "completed",
    fee: 0,
    settledAt: new Date().toISOString(),
    customerName: customerName || "Customer",
    customerBsb: customerBsb || "***-***",
    customerAccount: customerAccount ? "****" + customerAccount.slice(-4) : "****",
  };

  // Journal entry: reverse the original payment
  const journal = {
    journalId: "JE-REF-" + Date.now(),
    entries: [
      { account: "1010", name: "Cash at Bank", debit: 0, credit: parseFloat(amount), description: `Refund: ${reason}` },
      { account: "2010", name: "Customer Refunds Payable", debit: parseFloat(amount), credit: 0, description: `Refund for booking ${bookingId}` },
    ],
  };

  return res.status(200).json({
    success: true,
    refund,
    journal,
    branding: "Powered by PHLedger",
    costComparison: {
      stripe: `$${(parseFloat(amount) * 0.017 + 0.30).toFixed(2)} (non-refundable processing fee)`,
      phledger: "$0.00 (PayTo NPP — no refund fees)",
    },
  });
}
