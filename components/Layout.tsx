import { ReactNode, useState, useEffect } from 'react';
import { getLocale, setLocale, Locale, LOCALES } from '../lib/i18n';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agent', label: 'Agent' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/book', label: 'Book Service' },
  { href: '/about', label: 'About' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [country, setCountry] = useState('AU');
  const [lang, setLang] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem('ph_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    const c = localStorage.getItem('ph_country');
    if (c) setCountry(c);
    setLang(getLocale());
  }, []);

  const handleCountry = (c: string) => { setCountry(c); localStorage.setItem('ph_country', c); window.location.reload(); };
  const handleLang = (l: string) => { setLocale(l as Locale); setLang(l as Locale); window.location.reload(); };
  const handleSignOut = () => { localStorage.removeItem('ph_user'); localStorage.removeItem('ph_token'); window.location.href = '/auth/signin'; };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* HEADER */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
        padding: '0 20px',
        borderBottom: '3px solid #059669',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>📒</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
              PH<span style={{ color: '#4ade80' }}>Ledger</span>
            </span>
          </a>

          {/* Center Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)', textDecoration: 'none', padding: '6px 10px', borderRadius: 6 }}>{l.label}</a>
            ))}
          </nav>

          {/* Right: Country + Language + Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Country */}
            <select value={country} onChange={e => handleCountry(e.target.value)} style={{
              fontSize: '.74rem', padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,.3)',
              background: 'rgba(255,255,255,.1)', color: 'white', cursor: 'pointer', outline: 'none',
            }}>
              <option value="AU" style={{ color: '#000' }}>🇦🇺 Australia</option>
              <option value="CA" style={{ color: '#000' }}>🇨🇦 Canada</option>
            </select>

            {/* Language */}
            <select value={lang} onChange={e => handleLang(e.target.value)} style={{
              fontSize: '.74rem', padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,.3)',
              background: 'rgba(255,255,255,.1)', color: 'white', cursor: 'pointer', outline: 'none',
            }}>
              {LOCALES.map(l => (
                <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.flag} {l.native}</option>
              ))}
            </select>

            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)' }} />

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user.role === 'admin' && (
                  <a href="/admin" style={{ fontSize: '.68rem', padding: '3px 8px', background: '#fef3c7', borderRadius: 4, color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>ADMIN</a>
                )}
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.7)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                <button onClick={handleSignOut} style={{ fontSize: '.72rem', padding: '5px 10px', border: '1px solid rgba(255,255,255,.3)', borderRadius: 5, background: 'transparent', color: 'rgba(255,255,255,.85)', cursor: 'pointer' }}>Sign Out</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <a href="/auth/signin" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)', textDecoration: 'none', padding: '5px 10px' }}>Sign In</a>
                <a href="/auth/signup" style={{ fontSize: '.78rem', padding: '6px 14px', background: '#059669', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>Sign Up</a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, background: '#f8fafc' }}>{children}</main>

      {/* FOOTER */}
      <footer style={{ background: '#1e293b', color: 'rgba(255,255,255,.7)', padding: '32px 24px 20px', borderTop: '3px solid #059669' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>📒 PH<span style={{ color: '#4ade80' }}>Ledger</span></div>
              <p style={{ fontSize: '.72rem', lineHeight: 1.6, margin: 0, color: 'rgba(255,255,255,.5)' }}>Intelligent Finance Platform<br/>AU & CA businesses</p>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Platform</div>
              {[{h:'/agent',l:'Finance Agent'},{h:'/book',l:'Book Service'},{h:'/pricing',l:'Pricing'},{h:'/invoice/demo',l:'Invoicing'}].map(x=><a key={x.h} href={x.h} style={{display:'block',fontSize:'.75rem',color:'rgba(255,255,255,.65)',textDecoration:'none',marginBottom:4}}>{x.l}</a>)}
            </div>
            <div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Company</div>
              {[{h:'/about',l:'About'},{h:'/feedback',l:'Feedback'},{h:'https://www.linkedin.com/company/phledger/',l:'LinkedIn'}].map(x=><a key={x.h} href={x.h} style={{display:'block',fontSize:'.75rem',color:'rgba(255,255,255,.65)',textDecoration:'none',marginBottom:4}}>{x.l}</a>)}
            </div>
            <div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Account</div>
              {[{h:'/auth/signin',l:'Sign In'},{h:'/auth/signup',l:'Sign Up'},{h:'/admin',l:'Admin'}].map(x=><a key={x.h} href={x.h} style={{display:'block',fontSize:'.75rem',color:'rgba(255,255,255,.65)',textDecoration:'none',marginBottom:4}}>{x.l}</a>)}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>© 2026 PHLedger Pty Ltd. All rights reserved.</span>
            <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>🇦🇺 PayTo NPP ($0/tx) · 🇨🇦 Interac ($0.25/tx)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
