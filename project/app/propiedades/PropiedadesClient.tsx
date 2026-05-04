'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import AdminPanel from '@/components/AdminPanel';
import type { Property } from '@/lib/supabase';

interface Props {
  allProperties: Property[];
}

const zones = ['', 'Salamanca', 'Retiro', 'Chamartín', 'Malasaña', 'Lavapiés', 'La Finca', 'Madrid Centro'];
const types = ['', 'piso', 'atico', 'chalet', 'estudio', 'loft', 'local'];
const badges = ['', 'EXCLUSIVA', 'URGENTE', 'MARGEN'];

export default function PropiedadesClient({ allProperties }: Props) {
  const params = useSearchParams();
  const [zone, setZone] = useState(params.get('zona') || '');
  const [type, setType] = useState(params.get('tipo') || '');
  const [badge, setBadge] = useState('');
  const [maxPrice, setMaxPrice] = useState(params.get('max') || '');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...allProperties];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q));
    }
    if (zone) list = list.filter(p => p.zone === zone || p.city === zone);
    if (type) list = list.filter(p => p.property_type === type);
    if (badge) list = list.filter(p => p.badge === badge);
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'area') list.sort((a, b) => b.area_m2 - a.area_m2);

    return list;
  }, [allProperties, search, zone, type, badge, maxPrice, sort]);

  const hasFilters = zone || type || badge || maxPrice || search;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '100px 0 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-1px' }}>
            Propiedades exclusivas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17 }}>
            {allProperties.length} propiedades disponibles en Madrid
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
            {/* Search */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
                <input
                  type="text"
                  placeholder="Título, zona, descripción..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona</label>
              <select value={zone} onChange={e => setZone(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="">Todas las zonas</option>
                {zones.slice(1).map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="">Todos los tipos</option>
                {types.slice(1).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badge</label>
              <select value={badge} onChange={e => setBadge(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="">Cualquier badge</option>
                {badges.slice(1).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio máx.</label>
              <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="">Sin límite</option>
                <option value="200000">200.000 €</option>
                <option value="350000">350.000 €</option>
                <option value="500000">500.000 €</option>
                <option value="750000">750.000 €</option>
                <option value="1000000">1.000.000 €</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ordenar</label>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="area">Mayor superficie</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
              <button onClick={() => { setZone(''); setType(''); setBadge(''); setMaxPrice(''); setSearch(''); }} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Sin resultados</h3>
            <p style={{ color: '#9ca3af', fontSize: 15 }}>Prueba a cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i % 6} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <AdminPanel />
    </div>
  );
}
