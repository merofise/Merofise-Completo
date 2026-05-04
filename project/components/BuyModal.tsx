'use client';
import { useState } from 'react';
import type { Property } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface Props {
  property: Property;
  onClose: () => void;
}

type Step = 'choose' | 'form' | 'summary' | 'done';

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function generatePDF(data: {
  invoiceNumber: string;
  buyerName: string;
  buyerDni: string;
  propertyTitle: string;
  propertyAddress: string;
  finalPrice: number;
  arrasTotal: number;
  arrasOwner: number;
  arrasMetofise: number;
  honorarios: number;
  honorariosIVA: number;
  restNotary: number;
  offerType: string;
}) {
  const content = `
CONTRATO DE ARRAS - MEROFISE INMOBILIARIA
==========================================
Nº Contrato: ${data.invoiceNumber}
Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}

PARTES INTERVINIENTES
---------------------
VENDEDOR representado por:
  Nombre: Antonio Miguel Valenzuela Contreras
  DNI: 49001588L
  En calidad de: Representante Legal de Merofise

COMPRADOR:
  Nombre: ${data.buyerName}
  DNI/NIE: ${data.buyerDni}

INMUEBLE OBJETO DEL CONTRATO
-----------------------------
  Descripción: ${data.propertyTitle}
  Dirección: ${data.propertyAddress}

PRECIO Y CONDICIONES ECONÓMICAS
---------------------------------
  Precio total de compraventa: ${fmt(data.finalPrice)}

  ARRAS PENITENCIALES (10% del precio):
    → Total arras: ${fmt(data.arrasTotal)}
    → Correspondiente al propietario (8%): ${fmt(data.arrasOwner)}
    → Correspondiente a Merofise (2%): ${fmt(data.arrasMetofise)}

  HONORARIOS DE INTERMEDIACIÓN MEROFISE:
    → Honorarios (3%): ${fmt(data.honorarios)}
    → IVA (21% sobre honorarios): ${fmt(data.honorariosIVA)}
    → Total honorarios con IVA: ${fmt(data.honorarios + data.honorariosIVA)}

  RESTO A PAGAR ANTE NOTARIO:
    → Importe: ${fmt(data.restNotary)}

CLÁUSULAS Y CONDICIONES
-------------------------
1. Las arras entregadas tienen carácter penitencial conforme al artículo 1454 del Código Civil.
2. Los honorarios de intermediación de Merofise son NO REEMBOLSABLES bajo ninguna circunstancia,
   independientemente del resultado final de la operación.
3. En caso de desistimiento del comprador, este perderá las arras entregadas en su totalidad.
4. En caso de desistimiento del vendedor, este devolverá el doble de las arras recibidas.
5. El plazo para formalizar la compraventa ante notario será de 30 días naturales desde la firma.
6. Los gastos notariales e impuestos (ITP o IVA) corren a cargo del comprador.

FIRMA Y CONFORMIDAD
--------------------
El comprador declara haber leído, entendido y aceptado todas las condiciones del presente contrato.

_________________________________          _________________________________
Comprador: ${data.buyerName}              Representante Merofise:
DNI: ${data.buyerDni}                    Antonio M. Valenzuela Contreras
                                          DNI: 49001588L

Calle Lagasca 36, 28001 Madrid
Tel: +34 664 037 407 | info@merofise.es
  `;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Contrato_Arras_${data.invoiceNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateInvoice(data: {
  invoiceNumber: string;
  buyerName: string;
  buyerDni: string;
  propertyTitle: string;
  honorarios: number;
  iva: number;
}) {
  const total = data.honorarios + data.iva;
  const content = `
FACTURA
=======
Nº Factura: ${data.invoiceNumber}
Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}

EMISOR
------
Merofise Inmobiliaria
CIF: B-XXXXXXXX (pendiente de confirmar)
Calle Lagasca 36, 28001 Madrid
Tel: +34 664 037 407
Email: info@merofise.es
Representante: Antonio Miguel Valenzuela Contreras

CLIENTE
-------
Nombre: ${data.buyerName}
DNI/NIE: ${data.buyerDni}

CONCEPTO
--------
  Servicios de intermediación inmobiliaria
  Propiedad: ${data.propertyTitle}

DESGLOSE
--------
  Base imponible (honorarios 3%): ${fmt(data.honorarios)}
  IVA (21%):                       ${fmt(data.iva)}
  -------------------------------------------
  TOTAL FACTURA:                   ${fmt(total)}

NOTA: Los honorarios de intermediación son NO REEMBOLSABLES.

Gracias por confiar en Merofise.
Calle Lagasca 36, 28001 Madrid | info@merofise.es
  `;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Factura_${data.invoiceNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BuyModal({ property, onClose }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [offerType, setOfferType] = useState<'now' | 'negotiate'>('now');
  const [offeredPrice, setOfferedPrice] = useState(property.price);
  const [form, setForm] = useState({ name: '', dni: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [savedOffer, setSavedOffer] = useState<{
    finalPrice: number; arrasTotal: number; arrasOwner: number;
    arrasMetofise: number; honorarios: number; honorariosIVA: number; restNotary: number;
  } | null>(null);

  const finalPrice = offerType === 'now' ? property.price : offeredPrice;
  const arrasTotal = finalPrice * 0.10;
  const arrasOwner = finalPrice * 0.08;
  const arrasMetofise = finalPrice * 0.02;
  const honorarios = finalPrice * 0.03;
  const honorariosIVA = honorarios * 0.21;
  const restNotary = finalPrice - arrasTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.dni) {
      setError('Nombre y DNI son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');

    const invNum = await generateInvoiceNumber();

    const { error: dbError } = await supabase.from('offers').insert({
      property_id: property.id,
      property_title: property.title,
      property_price: property.price,
      offer_type: offerType,
      offered_price: offerType === 'negotiate' ? offeredPrice : null,
      buyer_name: form.name,
      buyer_dni: form.dni,
      buyer_email: form.email,
      buyer_phone: form.phone,
      arras_total: arrasTotal,
      arras_owner: arrasOwner,
      arras_merofise: arrasMetofise,
      honorarios,
      honorarios_iva: honorariosIVA,
      rest_notary: restNotary,
      invoice_number: invNum,
      contract_generated: true,
    });

    setLoading(false);
    if (dbError) {
      setError('Error al procesar la oferta. Por favor, inténtalo de nuevo.');
      return;
    }

    setInvoiceNumber(invNum);
    setSavedOffer({ finalPrice, arrasTotal, arrasOwner, arrasMetofise, honorarios, honorariosIVA, restNotary });
    setStep('done');

    generatePDF({
      invoiceNumber: invNum,
      buyerName: form.name,
      buyerDni: form.dni,
      propertyTitle: property.title,
      propertyAddress: property.address,
      finalPrice,
      arrasTotal,
      arrasOwner,
      arrasMetofise: arrasMetofise,
      honorarios,
      honorariosIVA,
      restNotary,
      offerType,
    });

    setTimeout(() => {
      generateInvoice({
        invoiceNumber: invNum,
        buyerName: form.name,
        buyerDni: form.dni,
        propertyTitle: property.title,
        honorarios,
        iva: honorariosIVA,
      });
    }, 1000);
  };

  async function generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const stored = parseInt(localStorage.getItem('merofise_invoice_seq') || '0', 10);
    const next = stored + 1;
    localStorage.setItem('merofise_invoice_seq', String(next));
    return `MER-${year}-${String(next).padStart(4, '0')}`;
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease-out' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
              {step === 'choose' && 'Comprar propiedad'}
              {step === 'form' && 'Tus datos'}
              {step === 'summary' && 'Resumen económico'}
              {step === 'done' && 'Documentos generados'}
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 340, lineHeight: 1.4 }}>{property.title}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* STEP: CHOOSE */}
          {step === 'choose' && (
            <div>
              <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '16px', marginBottom: 20, border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: 13, color: '#0369a1', fontWeight: 500, marginBottom: 4 }}>Precio de venta</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e' }}>{fmt(property.price)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => { setOfferType('now'); setStep('form'); }}
                  style={{
                    padding: '20px 16px', borderRadius: 12,
                    background: '#2563eb', border: 'none',
                    color: 'white', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Comprar ahora</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Al precio de {fmt(property.price)}</div>
                </button>
                <button
                  onClick={() => { setOfferType('negotiate'); setStep('form'); }}
                  style={{
                    padding: '20px 16px', borderRadius: 12,
                    background: 'white', border: '2px solid #2563eb',
                    color: '#1e40af', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Negociar precio</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Haz tu oferta</div>
                </button>
              </div>

              <div style={{ background: '#fff7ed', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#92400e', lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#d97706" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                Los honorarios de intermediación (3% + IVA) son NO reembolsables según nuestras condiciones.
              </div>
            </div>
          )}

          {/* STEP: FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              {offerType === 'negotiate' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tu oferta (€) *</label>
                  <input
                    type="number"
                    min={property.price * 0.5}
                    max={property.price * 1.2}
                    value={offeredPrice}
                    onChange={e => setOfferedPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.target.style.borderColor = '#2563eb')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Precio de referencia: {fmt(property.price)}</div>
                </div>
              )}

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>{error}</div>}

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Nombre completo *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Antonio García López"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>DNI / NIE *</label>
                <input type="text" required value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} placeholder="12345678A"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Teléfono</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34 600 000 000"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
              </div>

              {/* Economic summary preview */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 10 }}>Resumen económico</div>
                {[
                  { label: 'Precio final', val: fmt(finalPrice), bold: true },
                  { label: 'Arras totales (10%)', val: fmt(arrasTotal) },
                  { label: '→ Al propietario (8%)', val: fmt(arrasOwner) },
                  { label: '→ A Merofise (2%)', val: fmt(arrasMetofise) },
                  { label: 'Honorarios Merofise (3%)', val: fmt(honorarios) },
                  { label: 'IVA sobre honorarios (21%)', val: fmt(honorariosIVA) },
                  { label: 'Resto ante notario', val: fmt(restNotary), bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: row.bold ? '1px solid #e2e8f0' : 'none' }}>
                    <span style={{ color: '#6b7280' }}>{row.label}</span>
                    <span style={{ fontWeight: row.bold ? 700 : 400, color: '#111827' }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep('choose')} style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: 10, background: '#f3f4f6', border: 'none', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Atrás
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 10, background: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Procesando...' : '📄 Generar contrato y factura'}
                </button>
              </div>
            </form>
          )}

          {/* STEP: DONE */}
          {step === 'done' && savedOffer && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Documentos descargados</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Referencia: <strong>{invoiceNumber}</strong></p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                {[
                  { label: 'Precio acordado', val: fmt(savedOffer.finalPrice), highlight: true },
                  { label: 'Arras (10%)', val: fmt(savedOffer.arrasTotal) },
                  { label: 'Honorarios Merofise + IVA', val: fmt(savedOffer.honorarios + savedOffer.honorariosIVA) },
                  { label: 'Resto ante notario', val: fmt(savedOffer.restNotary) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: row.highlight ? 700 : 500, color: '#111827' }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={`https://wa.me/34664037407?text=Hola,%20acabo%20de%20firmar%20el%20contrato%20de%20arras%20(${encodeURIComponent(invoiceNumber)})%20para%20${encodeURIComponent(property.title)}.%20Quiero%20coordinar%20los%20siguientes%20pasos.`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#16a34a', color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Coordinar por WhatsApp
                </a>
                <button onClick={onClose} style={{ padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
