'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/AdminPanel';
import { supabase } from '@/lib/supabase';

type FormData = {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  zone: string;
  bedrooms: string;
  bathrooms: string;
  area_m2: string;
  property_type: string;
  badge: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  features: string;
};

const initialForm: FormData = {
  title: '', description: '', price: '', address: '', city: 'Madrid',
  zone: '', bedrooms: '', bathrooms: '', area_m2: '', property_type: 'piso',
  badge: '', owner_name: '', owner_phone: '', owner_email: '', features: '',
};

const benefits = [
  { icon: '🎯', title: 'Compradores cualificados', desc: 'Nuestra base de clientes está formada por compradores con financiación aprobada.' },
  { icon: '⚡', title: 'Publicación en 24h', desc: 'Tu propiedad aparece en nuestro portal en menos de 24 horas.' },
  { icon: '💼', title: 'Gestión completa', desc: 'Nos encargamos de visitas, negociaciones y papeleo notarial.' },
  { icon: '🔒', title: 'Sin exclusividad forzada', desc: 'Puedes mantener tu propiedad en otros portales sin problema.' },
];

export default function PublicarClient() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.address || !form.owner_name || !form.owner_phone) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    setLoading(true);
    setError('');

    const featuresArr = form.features.split(',').map(f => f.trim()).filter(Boolean);

    const { error: dbError } = await supabase.from('properties').insert({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      address: form.address,
      city: form.city || 'Madrid',
      zone: form.zone,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area_m2: Number(form.area_m2) || 0,
      property_type: form.property_type,
      badge: form.badge || '',
      owner_name: form.owner_name,
      owner_phone: form.owner_phone,
      owner_email: form.owner_email,
      features: featuresArr,
      images: [],
      is_featured: false,
      is_active: false,
    });

    setLoading(false);
    if (dbError) {
      setError('Error al publicar. Por favor inténtalo de nuevo.');
      return;
    }
    setSuccess(true);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: 'white',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600 as const,
    color: '#374151', marginBottom: 6,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '100px 0 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: 999, padding: '5px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 500 }}>100% gratuito</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-1px' }}>
            Publica tu propiedad gratis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 560 }}>
            Accede a nuestra base de compradores cualificados y vende tu propiedad al mejor precio.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

          {/* FORM */}
          <div>
            {success ? (
              <div style={{ background: 'white', borderRadius: 20, padding: 48, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Propiedad recibida</h2>
                <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 8, lineHeight: 1.6 }}>
                  Hemos recibido los datos de tu propiedad. Nuestro equipo la revisará en 24 horas y se pondrá en contacto contigo.
                </p>
                <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>
                  Referencia: {form.owner_phone}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/34664037407?text=Hola,%20acabo%20de%20publicar%20mi%20propiedad%20en%20Merofise:%20${encodeURIComponent(form.title)}.%20Mi%20nombre%20es%20${encodeURIComponent(form.owner_name)}.`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#16a34a', color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                  >
                    Confirmar por WhatsApp
                  </a>
                  <button onClick={() => { setForm(initialForm); setSuccess(false); setStep(1); }} style={{ padding: '12px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                    Publicar otra propiedad
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                {/* Steps */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                  {[1, 2, 3].map(s => (
                    <div key={s} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: step >= s ? '#2563eb' : '#f3f4f6', color: step >= s ? 'white' : '#9ca3af', transition: 'all 0.3s', flexShrink: 0 }}>
                          {step > s ? '✓' : s}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: step >= s ? '#1d4ed8' : '#9ca3af' }}>
                          {s === 1 ? 'Datos básicos' : s === 2 ? 'Detalles' : 'Contacto'}
                        </span>
                      </div>
                      {s < 3 && <div style={{ height: 2, background: step > s ? '#2563eb' : '#e5e7eb', borderRadius: 1, marginTop: 4, transition: 'background 0.3s' }} />}
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Datos básicos de la propiedad</h3>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Título del anuncio *</label>
                        <input type="text" required value={form.title} onChange={e => update('title', e.target.value)}
                          placeholder="Ej: Piso luminoso en Salamanca con terraza"
                          style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Descripción</label>
                        <textarea value={form.description} onChange={e => update('description', e.target.value)}
                          placeholder="Describe tu propiedad con detalle: estado, reformas, características especiales..."
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>Precio (€) *</label>
                          <input type="number" required min="1" value={form.price} onChange={e => update('price', e.target.value)}
                            placeholder="450000"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Tipo de propiedad *</label>
                          <select value={form.property_type} onChange={e => update('property_type', e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                            <option value="piso">Piso</option>
                            <option value="atico">Ático</option>
                            <option value="chalet">Chalet</option>
                            <option value="estudio">Estudio</option>
                            <option value="loft">Loft</option>
                            <option value="local">Local comercial</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Dirección completa *</label>
                        <input type="text" required value={form.address} onChange={e => update('address', e.target.value)}
                          placeholder="Calle Serrano 25, 28001 Madrid"
                          style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                        <div>
                          <label style={labelStyle}>Ciudad</label>
                          <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                            placeholder="Madrid"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Zona / Barrio</label>
                          <input type="text" value={form.zone} onChange={e => update('zone', e.target.value)}
                            placeholder="Salamanca, Retiro..."
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => { if (!form.title || !form.price || !form.address) { setError('Completa título, precio y dirección.'); } else { setError(''); setStep(2); } }} style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#2563eb', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')} onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}>
                        Siguiente: Detalles →
                      </button>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Detalles de la propiedad</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>Habitaciones</label>
                          <input type="number" min="0" max="20" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} placeholder="3"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Baños</label>
                          <input type="number" min="0" max="10" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="2"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Superficie (m²)</label>
                          <input type="number" min="0" value={form.area_m2} onChange={e => update('area_m2', e.target.value)} placeholder="120"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>Origen / Badge</label>
                          <select value={form.badge} onChange={e => update('badge', e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
                            <option value="">Sin badge especial</option>
                            <option value="EXCLUSIVA">EXCLUSIVA — Solo en Merofise</option>
                            <option value="URGENTE">URGENTE — Venta rápida</option>
                            <option value="MARGEN">MARGEN — Precio negociable</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Características (separadas por coma)</label>
                        <input type="text" value={form.features} onChange={e => update('features', e.target.value)}
                          placeholder="Garaje, Trastero, Terraza 40m², Reformado 2023..."
                          style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => { setError(''); setStep(1); }} style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 10, background: '#f3f4f6', border: 'none', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                          ← Atrás
                        </button>
                        <button type="button" onClick={() => { setError(''); setStep(3); }} style={{ flex: 1, padding: '13px', borderRadius: 10, background: '#2563eb', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')} onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}>
                          Siguiente: Datos de contacto →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Tus datos de contacto</h3>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Nombre completo *</label>
                        <input type="text" required value={form.owner_name} onChange={e => update('owner_name', e.target.value)}
                          placeholder="Antonio García López"
                          style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>Teléfono *</label>
                          <input type="tel" required value={form.owner_phone} onChange={e => update('owner_phone', e.target.value)}
                            placeholder="+34 600 000 000"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input type="email" value={form.owner_email} onChange={e => update('owner_email', e.target.value)}
                            placeholder="tu@email.com"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                      </div>

                      <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: '1px solid #bae6fd', fontSize: 13, color: '#0369a1', lineHeight: 1.6 }}>
                        Al publicar, aceptas que Merofise pueda contactarte para gestionar la venta de tu propiedad. Tus datos no serán compartidos con terceros.
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => { setError(''); setStep(2); }} style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 10, background: '#f3f4f6', border: 'none', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                          ← Atrás
                        </button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 10, background: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          {loading ? 'Publicando...' : '📤 Publicar propiedad gratis'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Benefits */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Por qué publicar con nosotros</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {benefits.map(b => (
                  <div key={b.title} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)', borderRadius: 16, padding: 24 }}>
              <h4 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>¿Tienes dudas?</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                Llámanos o escríbenos y te asesoramos sin compromiso.
              </p>
              <a href="tel:+34664037407" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: 10, transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)')}>
                📞 664 037 407
              </a>
              <a href="https://wa.me/34664037407" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#16a34a', borderRadius: 10, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#15803d')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#16a34a')}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <AdminPanel />
    </div>
  );
}
