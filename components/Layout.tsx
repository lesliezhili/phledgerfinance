import { ReactNode, useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agent', label: 'Agent' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/invoice/demo', label: 'Invoice' },
  { href: '/about', label: 'About' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [country, setCountry] = useState('AU');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Check auth
    const stored = localStorage.getItem('ph_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    // Check saved preferences
    const c = localStorage.getItem('ph_country');
    if (c) setCountry(c);
    const l = localStorage.getItem('ph_locale');
    if (l) setLang(l);
  }, []);

  const handleCountry = (c: string) => { setCountry(c); localStorage.setItem('ph_country', c); };
  const handleLang = (l: string) => { setLang(l); localStorage.setItem('ph_locale', l); window.location.reload(); };
  const handleSignOut = () => { localStorage.removeItem('ph_user'); localStorage.removeItem('ph_token'); window.location.href = '/auth/signin'; };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* HEADER */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
        padding: '0 24px',
        borderBottom: '3px solid #059669',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: '1.4rem' }}>📒</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
              PH<span style={{ color: '#4ade80' }}>Ledger</span>
            </span>
          </a>

          {/* Center Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{
                fontSize: '.8rem', color: 'rgba(255,255,255,.85)', textDecoration: 'none',
                padding: '6px 10px', borderRadius: 6,
              }}>{l.label}</a>
            ))}
          </nav>

          {/* Right: Country + Language + Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Country */}
            <select value={country} onChange={e => handleCountry(e.target.value)} style={{
              fontSize: '.72rem', padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,.3)',
              background: 'rgba(255,255,255,.1)', color: 'white', cursor: 'pointer', outline: 'none',
            }}>
              <option value="AU" style={{color:'#000'}}>🇦🇺 AU</option>
              <option value="CA" style={{color:'#000'}}>🇨🇦 CA</option>
            </select>

            {/* Language */}
            <select value={lang} onChange={e => handleLang(e.target.value)} style={{
              fontSize: '.72rem', padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,.3)',
              background: 'rgba(255,255,255,.1)', color: 'white', cursor: 'pointer', outline: 'none',
            }}>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{color:'#000'}}>{l.flag} {l.label}</option>
              ))}
            </select>

            {/* Divider */}
            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)' }} />

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user.role === 'admin' && (
                  <a href="/admin" style={{ fontSize: '.7rem', padding: '3px 8px', background: '#fef3c7', borderRadius: 4, color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>ADMIN</a>
                )}
                <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.7)' }}>{user.email}</span>
                <button onClick={handleSignOut} style={{
                  fontSize: '.72rem', padding: '5px 10px', border: '1px solid rgba(255,255,255,.3)',
                  borderRadius: 5, background: 'transparent', color: 'rgba(255,255,255,.85)', cursor: 'pointer',
                }}>Sign Out</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <a href="/auth/signin" style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', textDecoration: 'none', padding: '5px 10px' }}>Sign In</a>
                <a href="/auth/signup" style={{
                  fontSize: '.8rem', padding: '6px 14px', background: '#059669', color: 'white',
                  borderRadius: 6, textDecoration: 'none', fontWeight: 600,
                }}>Sign Up</a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{
        background: '#1e293b',
        color: 'rgba(255,255,255,.7)',
        padding: '32px 24px 20px',
        borderTop: '3px solid #059669',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 24 }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                📒 PH<span style={{ color: '#4ade80' }}>Ledger</span>
              </div>
              <p style={{ fontSize: '.75rem', lineHeight: 1.6, margin: 0, color: 'rgba(255,255,255,.5)' }}>
                Intelligent Finance Platform for Australian & Canadian businesses.
                Bookkeeping, payments, and tax — all in one place.
              </p>
            </div>

            {/* Platform */}
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Platform</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <a href="/agent" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Finance Agent</a>
                <a href="/pricing" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Pricing</a>
                <a href="/invoice/demo" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Invoicing (7 languages)</a>
                <a href="/payment/demo" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Payments</a>
                <a href="/refund/demo" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Refunds</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Company</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <a href="/about" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>About</a>
                <a href="/feedback" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Feedback</a>
                <a href="https://www.linkedin.com/company/phledger/" target="_blank" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>LinkedIn</a>
              </div>
            </div>

            {/* Account */}
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <a href="/auth/signin" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Sign In</a>
                <a href="/auth/signup" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Sign Up</a>
                <a href="/admin" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Admin Panel</a>
                <a href="/api/health" style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>System Status</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)' }}>
              © 2026 PHLedger Pty Ltd. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '.68rem' }}>
              <span style={{ color: 'rgba(255,255,255,.35)' }}>🇦🇺 Australia</span>
              <span style={{ color: 'rgba(255,255,255,.35)' }}>🇨🇦 Canada</span>
              <span style={{ color: 'rgba(255,255,255,.35)' }}>PayTo NPP · Interac</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
