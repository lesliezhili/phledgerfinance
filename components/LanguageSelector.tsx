import { useState, useEffect } from 'react';
import { LOCALES, getLocale, setLocale, Locale } from '../lib/i18n';

export default function LanguageSelector({ onChange, compact = false }: { onChange?: (l: Locale) => void; compact?: boolean }) {
  const [locale, setL] = useState<Locale>('en');
  useEffect(() => { setL(getLocale()); }, []);

  const change = (l: Locale) => { setL(l); setLocale(l); onChange?.(l); window.location.reload(); };

  if (compact) {
    return (
      <select value={locale} onChange={e => change(e.target.value as Locale)}
        style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: '.7rem', background: 'white', cursor: 'pointer' }}>
        {LOCALES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.native}</option>)}
      </select>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {LOCALES.map(l => (
        <button key={l.code} onClick={() => change(l.code)}
          style={{ padding: '4px 8px', borderRadius: 6, border: locale === l.code ? '2px solid #059669' : '1px solid #d1d5db',
            background: locale === l.code ? '#ecfdf5' : 'white', cursor: 'pointer', fontSize: '.7rem' }}>
          {l.flag} {l.native}
        </button>
      ))}
    </div>
  );
}
