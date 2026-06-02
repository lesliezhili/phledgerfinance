import { t, getLocale, Locale } from '../lib/i18n';
import LanguageSelector from './LanguageSelector';
import { useState } from 'react';

interface InvoiceItem { description: string; quantity: number; unitPrice: number; amount: number; }
interface Invoice { number: string; date: string; dueDate: string; from: { name: string; abn?: string; address?: string }; to: { name: string; address?: string }; items: InvoiceItem[]; subtotal: number; taxRate: number; tax: number; total: number; currency: string; status: string; notes?: string; bankDetails?: string; }

export default function InvoiceView({ invoice }: { invoice: Invoice }) {
  const [locale, setLocale] = useState<Locale>(getLocale());
  const T = (key: any) => t(locale, key);

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1e3a5f' }}>{T('invoice_title')} {invoice.number}</h2>
        <LanguageSelector compact onChange={l => setLocale(l)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div><strong>{T('invoice_from')}</strong><br/>{invoice.from.name}{invoice.from.abn && <><br/><span style={{fontSize:'.8rem',color:'#6b7280'}}>ABN: {invoice.from.abn}</span></>}{invoice.from.address && <><br/><span style={{fontSize:'.8rem',color:'#6b7280'}}>{invoice.from.address}</span></>}</div>
        <div><strong>{T('invoice_to')}</strong><br/>{invoice.to.name}{invoice.to.address && <><br/><span style={{fontSize:'.8rem',color:'#6b7280'}}>{invoice.to.address}</span></>}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, fontSize: '.83rem' }}>
        <div><span style={{color:'#6b7280'}}>{T('invoice_date')}</span><br/><strong>{invoice.date}</strong></div>
        <div><span style={{color:'#6b7280'}}>{T('invoice_due_date')}</span><br/><strong>{invoice.dueDate}</strong></div>
        <div><span style={{color:'#6b7280'}}>{T('payment_status')}</span><br/><span style={{padding:'2px 8px',borderRadius:10,fontSize:'.72rem',fontWeight:600,background:invoice.status==='paid'?'#dcfce7':invoice.status==='overdue'?'#fef2f2':'#fefce8',color:invoice.status==='paid'?'#166534':invoice.status==='overdue'?'#991b1b':'#854d0e'}}>{T('invoice_'+invoice.status as any)}</span></div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: '.83rem' }}>
        <thead><tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ textAlign: 'left', padding: '8px 4px' }}>{T('invoice_description')}</th>
          <th style={{ textAlign: 'center', padding: '8px 4px' }}>{T('invoice_quantity')}</th>
          <th style={{ textAlign: 'right', padding: '8px 4px' }}>{T('invoice_unit_price')}</th>
          <th style={{ textAlign: 'right', padding: '8px 4px' }}>{T('invoice_amount')}</th>
        </tr></thead>
        <tbody>{invoice.items.map((item, i) => <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
          <td style={{ padding: '8px 4px' }}>{item.description}</td>
          <td style={{ textAlign: 'center', padding: '8px 4px' }}>{item.quantity}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px' }}>${item.unitPrice.toFixed(2)}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px' }}>${item.amount.toFixed(2)}</td>
        </tr>)}</tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 220, fontSize: '.83rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>{T('invoice_subtotal')}</span><span>${invoice.subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#6b7280' }}><span>{invoice.currency === 'AUD' ? T('invoice_tax_gst') : T('invoice_tax_hst')}</span><span>${invoice.tax.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #1e3a5f', fontWeight: 700, fontSize: '.95rem' }}><span>{T('invoice_total')}</span><span>${invoice.total.toFixed(2)} {invoice.currency}</span></div>
        </div>
      </div>

      {invoice.bankDetails && <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: '.78rem' }}><strong>{T('invoice_bank_details')}</strong><br/>{invoice.bankDetails}</div>}
      {invoice.notes && <div style={{ marginTop: 12, fontSize: '.78rem', color: '#6b7280' }}><strong>{T('invoice_notes')}:</strong> {invoice.notes}</div>}
      <div style={{ marginTop: 24, textAlign: 'center', fontSize: '.65rem', color: '#9ca3af' }}>{T('common_powered_by')}</div>
    </div>
  );
}
