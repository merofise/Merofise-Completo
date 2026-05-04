'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import AdminPanel from '@/components/AdminPanel';
import HeatMap from '@/components/HeatMap';
import type { Property } from '@/lib/supabase';

interface Props {
  featured: Property[];
}

const zones = ['Madrid Centro', 'Salamanca', 'Retiro', 'Chamartín', 'Malasaña', 'Lavapiés', 'Pozuelo', 'Majadahonda', 'Las Rozas'];

const stats = [
  { num: '847', label: 'Propiedades vendidas' },
  { num: '€2.3M', label: 'Ahorro medio clientes' },
  { num: '98%', label: 'Satisfacción' },
  { num: '72h', label: 'Tiempo medio cierre' },
];

const trustItems = [
  { icon: '🏦', text: 'Banco Santander · BBVA · CaixaBank' },
  { icon: '⚖️', text: 'Colegio Notarial de Madrid' },
  { icon: '🏢', text: 'Calle Lagasca 36, 28001 Madrid' },
  { icon: '📞', text: '+34 664 037 407' },
];

export default function HomeClient({ featured }: Props) {
  const router = useRouter();
  const [searchZone, setSearchZone] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchMax, setSearchMax] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchZone) params.set('zona', searchZone);
    if (searchType) params.set('tipo', searchType);
    if (searchMax) params.set('max', searchMax);
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Background image with overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }} />

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, background: 'rgba(37,99,235,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'rgba(29,78,216,0.2)', borderRadius: '50%', filter: 'blur(60px)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Badge */}
          <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: 999, padding: '6px 14px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 6, height: 6, background: '#60a5fa', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#bfdbfe', fontWeight: 500 }}>Propiedades exclusivas en Madrid</span>
          </div>

          {/* Title */}
          <h1 className="animate-slide-up stagger-1" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1.5px', maxWidth: 750 }}>
            Las propiedades que{' '}
            <span style={{ color: '#60a5fa' }}>nadie más tiene</span>
          </h1>

          <p className="animate-slide-up stagger-2" style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 48, maxWidth: 580 }}>
            Herencias, divorcios y embargos bancarios. Accede a propiedades exclusivas de Madrid a precios muy por debajo del mercado.
          </p>

          {/* Search box */}
          <div className="animate-slide-up stagger-3" style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 25px 50px rgba(0,0,0,0.3)', maxWidth: 720 }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona</label>
                  <select
                    value={searchZone}
                    onChange={e => setSearchZone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', color: searchZone ? '#111827' : '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Cualquier zona</option>
                    {zones.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</label>
                  <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', color: searchType ? '#111827' : '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Cualquier tipo</option>
                    <option value="piso">Piso</option>
                    <option value="atico">Ático</option>
                    <option value="chalet">Chalet</option>
                    <option value="estudio">Estudio</option>
                    <option value="loft">Loft</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio máx.</label>
                  <select
                    value={searchMax}
                    onChange={e => setSearchMax(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', color: searchMax ? '#111827' : '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Sin límite</option>
                    <option value="200000">200.000 €</option>
                    <option value="350000">350.000 €</option>
                    <option value="500000">500.000 €</option>
                    <option value="750000">750.000 €</option>
                    <option value="1000000">1.000.000 €</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '11px 20px', background: '#2563eb', color: 'white',
                    borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  </svg>
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Quick links */}
          <div className="animate-fade-in stagger-4" style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {['Herencias en Salamanca', 'Divorcios Retiro', 'Embargos Chamartín', 'Ver todo'].map(q => (
              <button
                key={q}
                onClick={() => router.push('/propiedades')}
                style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Explorar</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background: '#0f172a', padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {trustItems.map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '72px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {stats.map((s, i) => (
              <div key={s.label} className={`animate-slide-up stagger-${i + 1}`} style={{ textAlign: 'center', padding: '32px 24px', borderRadius: 16, background: i % 2 === 0 ? '#f8fafc' : '#eff6ff' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#2563eb', letterSpacing: '-2px', marginBottom: 6 }}>{s.num}</div>
                <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', borderRadius: 999, padding: '4px 12px', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Propiedades destacadas</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Oportunidades únicas<br />en Madrid
              </h2>
            </div>
            <a
              href="/propiedades"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1d4ed8')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#2563eb')}
            >
              Ver todas
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {featured.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <HeatMap />

      {/* WHY MEROFISE */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', borderRadius: 999, padding: '4px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por qué Merofise</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 16 }}>
              Acceso exclusivo a propiedades<br />que el mercado no ve
            </h2>
            <p style={{ color: '#6b7280', fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Trabajamos directamente con bancos, juzgados y familias para ofrecerte oportunidades que no encontrarás en ningún portal inmobiliario.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🏦', title: 'Embargos bancarios', desc: 'Acceso directo a carteras de activos inmobiliarios de entidades bancarias con precios de liquidación.' },
              { icon: '⚖️', title: 'Procesos judiciales', desc: 'Propiedades de divorcios y herencias gestionadas directamente con letrados y notarios.' },
              { icon: '📋', title: 'Documentación lista', desc: 'Toda la documentación legal preparada. Solo tienes que llegar a la notaría y firmar.' },
              { icon: '💰', title: 'Precio garantizado', desc: 'Precio acordado por contrato de arras. Sin sorpresas, sin cambios de última hora.' },
              { icon: '🤝', title: 'Asesoramiento total', desc: 'Desde la primera visita hasta el notario. Te acompañamos en cada paso del proceso.' },
              { icon: '⚡', title: 'Cierre en 72 horas', desc: 'Una vez acordado el precio, podemos firmar arras y coordinar la notaría en 72 horas.' },
            ].map((item, i) => (
              <div key={item.title} className={`animate-slide-up stagger-${(i % 6) + 1}`} style={{ padding: '28px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e5e7eb', transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PUBLISH */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.2 }}>
            ¿Tienes una propiedad<br />que quieres vender?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, lineHeight: 1.7 }}>
            Publicamos tu propiedad gratis y la ponemos ante miles de compradores cualificados. Sin compromisos, sin permanencia.
          </p>
          <a
            href="/publicar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 32px', background: 'white', color: '#1d4ed8', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            Publicar propiedad gratis
          </a>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 12 }}>
              Proceso de compra en 4 pasos
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Simple, transparente y seguro. Así funciona Merofise.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Elige tu propiedad', desc: 'Explora nuestro catálogo exclusivo y encuentra la propiedad que se ajusta a ti.' },
              { step: '02', title: 'Solicita una visita', desc: 'Agenda una visita gratuita. Te acompañamos y respondemos todas tus dudas.' },
              { step: '03', title: 'Firma arras', desc: 'Acuerda el precio y firma el contrato de arras. Documentos generados al instante.' },
              { step: '04', title: 'Notaría', desc: 'En 30 días máximo, firma ante notario y recibe las llaves de tu nueva propiedad.' },
            ].map((item, i) => (
              <div key={item.step} className={`animate-slide-up stagger-${i + 1}`} style={{ position: 'relative', padding: '32px 24px', background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 16, color: '#2563eb' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                {i < 3 && (
                  <div style={{ position: 'absolute', top: '50%', right: -12, transform: 'translateY(-50%)', display: 'none' }} className="md:block">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#d1d5db">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <AdminPanel />
    </div>
  );
}
