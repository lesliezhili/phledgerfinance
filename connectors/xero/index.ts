/**
 * PHLedger Xero Connector — Open-source Xero API integration
 * 
 * Syncs: invoices, payments, contacts, BAS data
 * Two-way: PHLedger ↔ Xero
 * 
 * Auth: OAuth 2.0 (Xero requires this for all API access)
 * Scopes: accounting.transactions, accounting.contacts, accounting.settings
 */

export interface XeroConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
  scopes: string[];
}

export interface XeroInvoice {
  invoiceId?: string;
  invoiceNumber: string;
  contact: { name: string; email: string };
  lineItems: XeroLineItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  currencyCode: "AUD" | "CAD";
  status: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "PAID" | "VOIDED";
  dueDate: string;
  reference?: string;
}

export interface XeroLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  taxType: string; // "OUTPUT" for GST, "NONE" for GST-free
  accountCode: string; // e.g., "200" for sales revenue
}

export interface XeroContact {
  contactId?: string;
  name: string;
  email: string;
  phone?: string;
  isCustomer: boolean;
  isSupplier: boolean;
  taxNumber?: string; // ABN for AU, BN for CA
}

// Xero OAuth 2.0 token management
export interface XeroTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tenantId: string;
}

const XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
const XERO_API_BASE = "https://api.xero.com/api.xro/2.0";

/**
 * Generate Xero OAuth authorize URL
 */
export function getXeroAuthUrl(config: XeroConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
  });
  return `${XERO_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange auth code for tokens
 */
export async function exchangeXeroCode(code: string, config: XeroConfig): Promise<XeroTokens> {
  const resp = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(config.clientId + ":" + config.clientSecret).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
  });
  const data = await resp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    tenantId: "", // Set after calling /connections
  };
}

/**
 * Create an invoice in Xero
 */
export async function createXeroInvoice(
  invoice: XeroInvoice,
  tokens: XeroTokens
): Promise<{ invoiceId: string; invoiceNumber: string }> {
  const body = {
    Type: "ACCREC", // Accounts Receivable (sales invoice)
    Contact: { Name: invoice.contact.name, EmailAddress: invoice.contact.email },
    LineItems: invoice.lineItems.map(li => ({
      Description: li.description,
      Quantity: li.quantity,
      UnitAmount: li.unitAmount,
      TaxType: li.taxType,
      AccountCode: li.accountCode,
    })),
    DueDate: invoice.dueDate,
    Reference: invoice.reference,
    CurrencyCode: invoice.currencyCode,
    Status: invoice.status,
  };

  const resp = await fetch(`${XERO_API_BASE}/Invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "xero-tenant-id": tokens.tenantId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Invoices: [body] }),
  });
  const data = await resp.json();
  const created = data.Invoices?.[0];
  return { invoiceId: created?.InvoiceID || "", invoiceNumber: created?.InvoiceNumber || "" };
}

/**
 * Create GST report data for BAS filing (AU)
 */
export function generateBasData(invoices: XeroInvoice[], period: { from: string; to: string }) {
  let g1 = 0; // Total sales (inc GST)
  let g11 = 0; // Non-capital purchases (inc GST)
  let _1a = 0; // GST on sales
  let _1b = 0; // GST on purchases

  for (const inv of invoices) {
    g1 += inv.total;
    _1a += inv.totalTax;
  }

  return {
    period,
    g1: Math.round(g1 * 100) / 100,
    g11: Math.round(g11 * 100) / 100,
    "1A": Math.round(_1a * 100) / 100,
    "1B": Math.round(_1b * 100) / 100,
    gstPayable: Math.round((_1a - _1b) * 100) / 100,
  };
}
