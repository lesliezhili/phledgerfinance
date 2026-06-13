import { describe, it, expect, beforeAll } from "vitest"
import { summarizeFinance, autoReleaseEscrow, type BookingLedgerRow } from "../lib/phledger/finance"
import { isPhledgerAdmin } from "../lib/phledger/auth"

const rows: BookingLedgerRow[] = [
  { bookingId: "b1", status: "completed", customerTotal: 201.28, net: 182.98, gst: 18.30, platformFee: 14.64, providerPayout: 168.34, discountTotal: 5.66, fundingScheme: "private" },
  { bookingId: "b2", status: "pending",   customerTotal: 110,    net: 100,    gst: 10,    platformFee: 8,     providerPayout: 92,     discountTotal: 0,    fundingScheme: "ndis" },
  { bookingId: "b3", status: "cancelled", customerTotal: 999,    net: 900,    gst: 90,    platformFee: 72,    providerPayout: 828,    discountTotal: 0 },
]

describe("summarizeFinance", () => {
  const s = summarizeFinance(rows)
  it("excludes cancelled bookings from revenue", () => {
    expect(s.grossRevenue).toBeCloseTo(311.28, 2)
    expect(s.bookings).toBe(3)
  })
  it("routes completed payout to payoutsDue", () => {
    expect(s.payoutsDue).toBeCloseTo(168.34, 2)
  })
  it("holds pending payout in escrow", () => {
    expect(s.escrowHeld).toBeCloseTo(92, 2)
  })
  it("splits revenue by funding scheme", () => {
    expect(s.byScheme.private).toBeCloseTo(201.28, 2)
    expect(s.byScheme.ndis).toBeCloseTo(110, 2)
  })
  it("sums GST and platform fees (excl cancelled)", () => {
    expect(s.gstCollected).toBeCloseTo(28.30, 2)
    expect(s.platformFees).toBeCloseTo(22.64, 2)
  })
})

describe("autoReleaseEscrow", () => {
  it("releases payout for completed bookings", () => {
    expect(autoReleaseEscrow(rows[0])).toEqual({ release: true, amount: 168.34 })
  })
  it("withholds payout for pending bookings", () => {
    expect(autoReleaseEscrow(rows[1])).toEqual({ release: false, amount: 0 })
  })
})

describe("isPhledgerAdmin", () => {
  beforeAll(() => {
    process.env.PHLEDGER_ADMIN_EMAIL = "admin@phledger.com"
    process.env.PHLEDGER_ADMIN_PASSWORD = "s3cret-pass"
  })
  it("accepts exact admin credentials (case-insensitive email)", () => {
    expect(isPhledgerAdmin("ADMIN@phledger.com", "s3cret-pass")).toBe(true)
  })
  it("rejects a wrong password", () => {
    expect(isPhledgerAdmin("admin@phledger.com", "nope")).toBe(false)
  })
  it("rejects when credentials are missing", () => {
    expect(isPhledgerAdmin(undefined, undefined)).toBe(false)
  })
})
