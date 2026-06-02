import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/credit-note — Generate credit note + reversing journal entry
 * 
 * Body: { bookingId, amount, reason, originalInvoice? }
 * 
 * Creates a credit note against the original invoice and records
 * the reversing journal entry for BAS/GST compliance.
 * 
 * PHLedger is FREE exclusively for PHLedger & SilverConnect.
 */

let creditNoteCounter = 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId, amount, reason, originalInvoice } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: "bookingId and amount required" });
  }

  creditNoteCounter++;
  const creditNoteNumber = `SC-CN-${String(creditNoteCounter).padStart(4, "0")}`;
  const parsedAmount = parseFloat(amount);
  const gstAmount = Math.round(parsedAmount / 11 * 100) / 100;
  const netAmount = Math.round((parsedAmount - gstAmount) * 100) / 100;

  const creditNote = {
    creditNoteNumber,
    bookingId,
    originalInvoice: originalInvoice || "N/A",
    date: new Date().toISOString().split("T")[0],
    reason: reason || "Refund / cancellation",
    grossAmount: parsedAmount,
    gstAmount,
    netAmount,
    status: "issued",
  };

  // Reversing journal entries for accounting
  const journal = {
    journalId: "JE-CN-" + Date.now(),
    entries: [
      { account: "4000", name: "Service Revenue", debit: netAmount, credit: 0, description: `Credit note ${creditNoteNumber} — revenue reversal` },
      { account: "2200", name: "GST Collected", debit: gstAmount, credit: 0, description: `Credit note ${creditNoteNumber} — GST reversal` },
      { account: "1100", name: "Accounts Receivable", debit: 0, credit: parsedAmount, description: `Credit note ${creditNoteNumber} — receivable reversal` },
    ],
  };

  // BAS impact
  const basImpact = {
    period: new Date().toISOString().slice(0, 7),
    gstReduction: gstAmount,
    note: "Credit note reduces GST collected for this BAS period",
  };

  return res.status(200).json({
    success: true,
    creditNote,
    journal,
    basImpact,
    branding: "Powered by PHLedger",
  });
}
