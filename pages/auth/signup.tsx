import Layout from '../../components/Layout';
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PLANS = [
  { id: 'starter', name: 'Starter', aud: 29, cad: 25, desc: '5,000 txs/mo, auto-categorise, P&L' },
  { id: 'professional', name: 'Professional', aud: 79, cad: 69, desc: 'Unlimited txs, multi-entity, BAS auto-lodge', rec: true },
  { id: 'enterprise', name: 'Enterprise', aud: 199, cad: 179, desc: 'SSO, custom rules, dedicated support' },
];

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('AU');
  const [plan, setPlan] = useState('starter');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw, name, country, plan }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error); setLoading(false); return; }
      localStorage.setItem('ph_user', JSON.stringify(d.user));
      localStorage.setItem('ph_token', d.token || '');
      localStorage.setItem('ph_country', country);
      router.push('/book');
    } catch { setErr('Network error'); }
    setLoading(false);
  };

  const cur = country === 'AU' ? 'AUD' : 'CAD';
  const selPlan = PLANS.find(p => p.id === plan);
  const price = selPlan ? (country === 'AU' ? selPlan.aud : selPlan.cad) : 0;

  return (<><Head><title>Sign Up — PHLedger</title></Head>
  <Layout>
  <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
    <div style={{ background: 'white', borderRadius: 12, padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', color: '#1e3a5f', margin: 0 }}>Create Account</h1>
        <p style={{ color: '#6b7280', fontSize: '.82rem', margin: '6px 0 0' }}>14-day free trial · No credit card required</p>
      </div>

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <label style={{ display: 'block' }}><span style={{ fontSize: '.72rem', color: '#374151', fontWeight: 500 }}>Full Name</span>
            <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.82rem', marginTop: 3, boxSizing: 'border-box' }} /></label>
          <label style={{ display: 'block' }}><span style={{ fontSize: '.72rem', color: '#374151', fontWeight: 500 }}>Country</span>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.82rem', marginTop: 3, boxSizing: 'border-box' }}>
              <option value="AU">🇦🇺 Australia</option>
              <option value="CA">🇨🇦 Canada</option>
            </select></label>
        </div>

        <label style={{ display: 'block', marginBottom: 10 }}><span style={{ fontSize: '.72rem', color: '#374151', fontWeight: 500 }}>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.82rem', marginTop: 3, boxSizing: 'border-box' }} /></label>

        <label style={{ display: 'block', marginBottom: 16 }}><span style={{ fontSize: '.72rem', color: '#374151', fontWeight: 500 }}>Password</span>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.82rem', marginTop: 3, boxSizing: 'border-box' }} /></label>

        {/* Plan Selection */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '.72rem', color: '#374151', fontWeight: 500, display: 'block', marginBottom: 8 }}>Select Plan (14-day free trial)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PLANS.map(p => (
              <label key={p.id} onClick={() => setPlan(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: plan === p.id ? '2px solid #059669' : '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: plan === p.id ? '#f0fdf4' : 'white' }}>
                <input type="radio" name="plan" checked={plan === p.id} onChange={() => setPlan(p.id)} style={{ accentColor: '#059669' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#1e3a5f' }}>
                    {p.name} {p.rec && <span style={{ fontSize: '.6rem', padding: '2px 6px', background: '#059669', color: 'white', borderRadius: 4, marginLeft: 6 }}>RECOMMENDED</span>}
                  </div>
                  <div style={{ fontSize: '.7rem', color: '#6b7280' }}>{p.desc}</div>
                </div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#059669' }}>${country === 'AU' ? p.aud : p.cad}<span style={{ fontSize: '.65rem', fontWeight: 400, color: '#6b7280' }}>/{cur}/mo</span></div>
              </label>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: '.72rem', color: '#374151' }}>
          <strong>After sign up you can:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Book services and view bookings</li>
            <li>Pay invoices via PayTo NPP (AU, $0 fee) or Interac (CA, $0.25)</li>
            <li>Setup credit/payment method for recurring charges</li>
            <li>View invoices, payments, refunds in 7 languages</li>
          </ul>
        </div>

        {err && <div style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: 6, color: '#dc2626', fontSize: '.78rem', marginBottom: 12 }}>{err}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? 'Creating...' : `Start 14-Day Free Trial — ${selPlan?.name} ($${price} ${cur}/mo after)`}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '.78rem', color: '#6b7280', marginTop: 16 }}>Already have an account? <a href="/auth/signin" style={{ color: '#059669' }}>Sign In</a></p>
    </div>
  </div>
  </Layout></>);
}
