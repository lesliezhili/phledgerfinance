/**
 * SilverConnect × Xero Integration
 * 
 * Auto-generates invoices for:
 * 1. Customer bookings (sales invoices)
 * 2. Provider payouts (bills/purchase orders)
 * 3. Platform fee revenue tracking
 * 
 * GST handling:
 * - Service fee: GST-inclusive (÷ 11 to extract GST)
 * - Platform fee: GST on platform's commission
 * - Provider payout: GST-free (provider handles own GST)
 */

import { XeroInvoice, XeroLineItem, XeroTokens, createXeroInvoice } from "./index";

export interface BookingInvoiceData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  duration: number; // minutes
  totalPrice: number;
  basePrice: number;
  gstAmount: number;
  providerName: string;
  platformFee: number;
  scheduledAt: string;
}

/**
 * Generate customer invoice for a booking
 */
export function buildCustomerInvoice(booking: BookingInvoiceData): XeroInvoice {
  const lineItem: XeroLineItem = {
    description: `${booking.serviceName} — ${booking.duration} min (${new Date(booking.scheduledAt).toLocaleDateString()})`,
    quantity: 1,
    unitAmount: booking.basePrice,
    taxType: "OUTPUT", // GST applies
    accountCode: "200", // Sales revenue
  };

  return {
    invoiceNumber: `SC-${booking.bookingId}`,
    contact: { name: booking.customerName, email: booking.customerEmail },
    lineItems: [lineItem],
    subtotal: booking.basePrice,
    totalTax: booking.gstAmount,
    total: booking.totalPrice,
    currencyCode: "AUD",
    status: "AUTHORISED",
    dueDate: new Date(booking.scheduledAt).toISOString().split("T")[0],
    reference: `Booking ${booking.bookingId}`,
  };
}

/**
 * Generate provider payout record
 */
export function buildProviderPayout(booking: BookingInvoiceData): XeroInvoice {
  const providerAmount = booking.totalPrice - booking.platformFee;

  return {
    invoiceNumber: `SC-PAY-${booking.bookingId}`,
    contact: { name: booking.providerName, email: "" },
    lineItems: [{
      description: `Payout: ${booking.serviceName} — Booking ${booking.bookingId}`,
      quantity: 1,
      unitAmount: providerAmount,
      taxType: "NONE", // Provider handles own GST
      accountCode: "400", // Cost of sales
    }],
    subtotal: providerAmount,
    totalTax: 0,
    total: providerAmount,
    currencyCode: "AUD",
    status: "AUTHORISED",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  };
}
