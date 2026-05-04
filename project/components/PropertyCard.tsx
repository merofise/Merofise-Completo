'use client';
import { useState } from 'react';
import type { Property } from '@/lib/supabase';
import VisitModal from './VisitModal';
import BuyModal from './BuyModal';

interface Props {
  property: Property;
  index?: number;
}

const badgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  EXCLUSIVA: { bg: '#1e3a5f', color: '#ffffff', label: 'EXCLUSIVA' },
  URGENTE: { bg: '#dc2626', color: '#ffffff', label: 'URGENTE' },
  MARGEN: { bg: '#d97706', color: '#ffffff', label: 'MARGEN' },
};

const typeIcons: Record<string, string> = {
  piso: '🏢',
  atico: '🏙️',
  chalet: '🏡',
  estudio: '🏠',
  loft: '🏗️',
  local: '🏪',
};

export default function PropertyCard({ property, index = 0 }: Props) {
  const [visitOpen, setVisitOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const badge = badgeStyles[property.badge];
  const mainImage = !imgError && property.images?.[0]
    ? property.images[0]
    : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';

  const priceStr = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);

  return (
    <>
      <article
        className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
        style={{
          background: 'white',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f3f4f6' }}>
          <img
            src={mainImage}
            alt={property.title}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {/* Badge */}
          {badge && (
            <div style={{
              position: 'absolute',
              top: 12, left: 12,
              background: badge.bg,
              color: badge.color,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}>
              {badge.label}
            </div>
          )}
          {/* Price overlay */}
          <div style={{
            position: 'absolute',
            bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            backdropFilter: 'blur(4px)',
          }}>
            {priceStr}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Type + zone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500, textTransform: 'capitalize' }}>
              {typeIcons[property.property_type] || '🏠'} {property.property_type}
            </span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{property.zone || property.city}</span>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.4, marginBottom: 8, flex: 1 }}>
            {property.title}
          </h3>

          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {property.description}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 14 }}>
            {property.bedrooms > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                </svg>
                <span>{property.bedrooms} hab</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0H11c0 2.21-1.79 4-4 4v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-2.21-1.79-4-4-4z"/>
                </svg>
                <span>{property.bathrooms} baños</span>
              </div>
            )}
            {property.area_m2 > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
                </svg>
                <span>{property.area_m2} m²</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setVisitOpen(true)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                background: 'white', border: '1.5px solid #2563eb',
                color: '#2563eb', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              Visitar
            </button>
            <button
              onClick={() => setBuyOpen(true)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                background: '#2563eb', border: 'none',
                color: 'white', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563eb'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              Comprar
            </button>
          </div>
        </div>
      </article>

      {visitOpen && (
        <VisitModal
          property={property}
          onClose={() => setVisitOpen(false)}
        />
      )}
      {buyOpen && (
        <BuyModal
          property={property}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </>
  );
}
