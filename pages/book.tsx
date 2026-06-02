import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getLocale, t, Locale } from '../lib/i18n';

const SERVICES = [
  { id: 'bookkeeping', name: 'Bookkeeping & Reconciliation', price_aud: 79, price_cad: 69, desc: 'Monthly automated bookkeeping with bank feed sync', duration: 'Monthly' },
  { id: 'bas_lodge', name: 'BAS / GST Lodgement', price_aud: 149, price_cad: 129, desc: 'Quarterly BAS preparation and ATO lodgement', duration: 'Quarterly' },
  { id: 'tax_return', name: 'Annual Tax Return', price_aud: 299, price_cad: 259, desc: 'Company or personal tax return preparation and filing', duration: 'Annual' },
  { id: 'payroll', name: 'Payroll Processing', price_aud: 49, price_cad: 45, desc: 'Fortnightly payroll run with STP compliance', duration: 'Per run' },
  { id: 'advisory', name: 'Finance Advisory Session', price_aud: 199, price_cad: 179, desc: '1-hour strategy session with AI-powered insights', duration: '60 min' },
];

export default function BookService() {
  const [country, setCountry] = useState('AU');
  const [selected, setSelected] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('payto');
  const [creditSetup, setCreditSetup] = useState(false);
  const [booked, setBooked] = useState(false);
  const [locale, setLocale2] = useState<Locale>('en');

  useEffect(() => {
    const c = localStorage.getItem('ph_country') || 'AU';
    setCountry(c);
    setLocale2(getLocale());
  }, []);

  const cur = country === 'AU' ? 'AUD' : 'CAD';
  const bankFee = country === 'AU' ? 0 : 0.25;
  const bankRail = country === 'AU' ? 'PayTo NPP' : 'Interac e-Transfer';
  const selService = SERVICES.find(s => s.id === selected);
  const servicePrice = selService ? (country === 'AU' ? selService.price_aud : selService.price_cad) : 0;
  const totalPrice = servicePrice + bankFee;

  const handleBook = () => { setBooked(true); };

  if (booked && selService) {
    return (<><Head><title>Booking Confirmed — PHLedger</title></Head>
    <Layout><div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
        <h2 style={{ color: '#059669', margin: '0 0 8px' }}>Booking Confirmed!</h2>
        <p style={{ color: '#6b7280', fontSize: '.85rem' }}>{selService.name}</p>
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 16, margin: '16px 0', fontSize: '.82rem' }}>
          <div><strong>Amount:</strong> ${servicePrice.toFixed(2)} {cur}</div>
          <div><strong>Bank Fee:</strong> ${bankFee.toFixed(2)} ({bankRail})</div>
          <div><strong>Total Charged:</strong> ${totalPrice.toFixed(2)} {cur}</div>
          <div><strong>Payment:</strong> {bankRail} — {country === 'AU' ? 'Instant, zero fees' : '$0.25 per transaction'}</div>
          {creditSetup && <div style={{ marginTop: 8, color: '#059669' }}><strong>✓ Credit setup for recurring payments</strong></div>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <a href="/invoice/demo" style={{ padding: '8px 16px', background: '#1e3a5f', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: '.82rem' }}>View Invoice</a>
          <a href="/payment/demo" style={{ padding: '8px 16px', background: '#059669', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: '.82rem' }}>View Payment</a>
          <a href="/book" onClick={() => setBooked(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none', fontSize: '.82rem', color: '#374151' }}>Book Another</a>
        </div>
      </div>
    </div></Layout></>);
  }

  return (<><Head><title>Book a Service — PHLedger</title></Head>
  <Layout>
  <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
    <h1 style={{ fontSize: '1.5rem', color: '#1e3a5f', marginBottom: 4 }}>Book a Service</h1>
    <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: 24 }}>Select a service, review fees, and pay instantly via {bankRail}.</p>

    {/* Service List */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
      {SERVICES.map(s => {
        const price = country === 'AU' ? s.price_aud : s.price_cad;
        return (
          <div key={s.id} onClick={() => setSelected(s.id)} style={{
            background: 'white', borderRadius: 10, padding: '16px 20px', cursor: 'pointer',
            border: selected === s.id ? '2px solid #059669' : '1px solid #e5e7eb',
            boxShadow: selected === s.id ? '0 0 0 3px rgba(5,150,105,.1)' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#1e3a5f' }}>{s.name}</div>
                <div style={{ fontSize: '.75rem', color: '#6b7280', marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>${price.toFixed(2)}</div>
                <div style={{ fontSize: '.65rem', color: '#9ca3af' }}>{cur} / {s.duration}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Checkout Panel */}
    {selService && (
      <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
        <h3 style={{ fontSize: '1rem', color: '#1e3a5f', margin: '0 0 16px' }}>Checkout — {selService.name}</h3>

        {/* Price breakdown */}
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: '.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Service fee</span><span style={{ fontWeight: 600 }}>${servicePrice.toFixed(2)} {cur}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#6b7280' }}>
            <span>Bank processing fee ({bankRail})</span><span>${bankFee.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '.9rem' }}>
            <span>Total</span><span style={{ color: '#059669' }}>${totalPrice.toFixed(2)} {cur}</span>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '.72rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Payment Method</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: payMethod === 'payto' ? '2px solid #059669' : '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: payMethod === 'payto' ? '#f0fdf4' : 'white' }}>
              <input type="radio" name="pay" checked={payMethod === 'payto'} onChange={() => setPayMethod('payto')} style={{ accentColor: '#059669' }} />
              <div><div style={{ fontSize: '.78rem', fontWeight: 600 }}>{country === 'AU' ? '🇦🇺 PayTo NPP' : '🇨🇦 Interac'}</div>
              <div style={{ fontSize: '.65rem', color: '#6b7280' }}>{country === 'AU' ? 'Instant · $0 fee' : 'Instant · $0.25 fee'}</div></div>
            </label>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: payMethod === 'bank' ? '2px solid #059669' : '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: payMethod === 'bank' ? '#f0fdf4' : 'white' }}>
              <input type="radio" name="pay" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} style={{ accentColor: '#059669' }} />
              <div><div style={{ fontSize: '.78rem', fontWeight: 600 }}>🏦 Bank Transfer</div>
              <div style={{ fontSize: '.65rem', color: '#6b7280' }}>1-2 business days · $0 fee</div></div>
            </label>
          </div>
        </div>

        {/* Credit setup */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
          <input type="checkbox" checked={creditSetup} onChange={e => setCreditSetup(e.target.checked)} style={{ accentColor: '#059669', width: 16, height: 16 }} />
          <span style={{ fontSize: '.78rem', color: '#374151' }}>Setup credit for automatic recurring payments</span>
        </label>

        {/* Book button */}
        <button onClick={handleBook} style={{ width: '100%', padding: 12, background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontSize: '.9rem', fontWeight: 600, cursor: 'pointer' }}>
          Confirm & Pay ${totalPrice.toFixed(2)} {cur} via {bankRail}
        </button>

        <p style={{ fontSize: '.68rem', color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
          {country === 'AU' ? 'PayTo mandate — instant settlement, zero processing fees.' : 'Interac e-Transfer — $0.25 per transaction, instant confirmation.'}
          {creditSetup && ' Recurring charges will use the same payment method.'}
        </p>
      </div>
    )}
  </div>
  </Layout></>);
}
