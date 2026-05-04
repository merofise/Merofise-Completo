'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Visit, Offer } from '@/lib/supabase';

let initialized = false;

export function initAdminShortcut() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      const password = window.prompt('Contraseña de administrador:');
      if (password === 'admin') {
        const event = new CustomEvent('openAdmin');
        window.dispatchEvent(event);
      } else if (password !== null) {
        alert('Contraseña incorrecta');
      }
    }
  });
}

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'visits' | 'offers'>('visits');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initAdminShortcut();

    const handler = () => {
      setOpen(true);
      loadData();
    };
    window.addEventListener('openAdmin', handler);
    return () => window.removeEventListener('openAdmin', handler);
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: v }, { data: o }] = await Promise.all([
      supabase.from('visits').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('offers').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setVisits(v || []);
    setOffers(o || []);
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}
    >
      <div style={{ background: '#0f172a', borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid #1e293b' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Panel Administrador — Merofise</h2>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: '#1e293b', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 4 }}>
          {(['visits', 'offers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', color: tab === t ? '#60a5fa' : '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1 }}>
              {t === 'visits' ? `Visitas (${visits.length})` : `Ofertas (${offers.length})`}
            </button>
          ))}
          <button onClick={loadData} style={{ marginLeft: 'auto', padding: '8px 14px', background: '#1e293b', border: 'none', borderRadius: 8, color: '#94a3b8', fontSize: 12, cursor: 'pointer', alignSelf: 'center' }}>
            ↻ Actualizar
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#64748b', fontSize: 14 }}>Cargando datos...</div>
          ) : tab === 'visits' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Nombre', 'DNI', 'Propiedad', 'Fecha', 'Hora', 'Teléfono', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No hay visitas registradas</td></tr>
                ) : visits.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #0f172a' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{v.first_name} {v.last_name}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>{v.dni}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.property_title}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{v.visit_date}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{v.visit_time}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{v.phone || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: v.status === 'confirmada' ? '#14532d' : '#1c3444', color: v.status === 'confirmada' ? '#86efac' : '#60a5fa' }}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Comprador', 'DNI', 'Propiedad', 'Tipo', 'Precio', 'Factura', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No hay ofertas registradas</td></tr>
                ) : offers.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #0f172a' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{o.buyer_name}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>{o.buyer_dni}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.property_title}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: o.offer_type === 'now' ? '#1c3444' : '#2d1b3d', color: o.offer_type === 'now' ? '#60a5fa' : '#c084fc' }}>
                        {o.offer_type === 'now' ? 'Compra directa' : 'Negociación'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(o.offered_price || o.property_price)}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{o.invoice_number || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#1a2e1a', color: '#86efac' }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#475569' }}>Merofise Admin Panel · Ctrl+Shift+A para abrir</span>
          <a href="https://vimnibatlmaqhphzzbmg.supabase.co" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>Supabase Dashboard →</a>
        </div>
      </div>
    </div>
  );
}
