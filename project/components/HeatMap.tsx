'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/lib/supabase';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC-cZxCNptlqs6s3zUhHCatuAe4Ci4lZ_U';

// ─── Zone metadata ────────────────────────────────────────────────────────────
const ZONE_META: Record<string, { lat: number; lng: number; spread: number; marketPriceM2: number }> = {
  'Salamanca':     { lat: 40.4250, lng: -3.6730, spread: 0.012, marketPriceM2: 7200 },
  'Chamberí':      { lat: 40.4330, lng: -3.6990, spread: 0.013, marketPriceM2: 6800 },
  'Retiro':        { lat: 40.4110, lng: -3.6800, spread: 0.013, marketPriceM2: 6400 },
  'Centro':        { lat: 40.4168, lng: -3.7038, spread: 0.012, marketPriceM2: 6000 },
  'Malasaña':      { lat: 40.4240, lng: -3.7050, spread: 0.009, marketPriceM2: 5800 },
  'Chueca':        { lat: 40.4230, lng: -3.6990, spread: 0.008, marketPriceM2: 5900 },
  'Lavapiés':      { lat: 40.4070, lng: -3.7040, spread: 0.009, marketPriceM2: 4800 },
  'Chamartín':     { lat: 40.4530, lng: -3.6840, spread: 0.015, marketPriceM2: 5200 },
  'Tetuán':        { lat: 40.4450, lng: -3.7020, spread: 0.013, marketPriceM2: 4200 },
  'Arganzuela':    { lat: 40.3990, lng: -3.7020, spread: 0.012, marketPriceM2: 4000 },
  'Moncloa':       { lat: 40.4320, lng: -3.7230, spread: 0.014, marketPriceM2: 5000 },
  'Hortaleza':     { lat: 40.4760, lng: -3.6560, spread: 0.016, marketPriceM2: 3800 },
  'Carabanchel':   { lat: 40.3880, lng: -3.7370, spread: 0.016, marketPriceM2: 2800 },
  'Vallecas':      { lat: 40.3860, lng: -3.6670, spread: 0.016, marketPriceM2: 2600 },
  'Usera':         { lat: 40.3940, lng: -3.7100, spread: 0.012, marketPriceM2: 2900 },
  'Moratalaz':     { lat: 40.4000, lng: -3.6560, spread: 0.013, marketPriceM2: 3000 },
  'La Finca':      { lat: 40.4100, lng: -3.8060, spread: 0.010, marketPriceM2: 6500 },
  'Pozuelo':       { lat: 40.4320, lng: -3.8140, spread: 0.016, marketPriceM2: 4800 },
  'Majadahonda':   { lat: 40.4730, lng: -3.8730, spread: 0.016, marketPriceM2: 4200 },
  'Las Rozas':     { lat: 40.4940, lng: -3.8740, spread: 0.016, marketPriceM2: 3900 },
};

// Baseline market weight per zone (used when Supabase has no data)
const BASELINE_WEIGHTS: Record<string, number> = {
  'Salamanca': 9, 'Chamberí': 8, 'Retiro': 7, 'Centro': 8, 'Chueca': 6,
  'Malasaña': 6, 'Lavapiés': 4, 'Chamartín': 5, 'Tetuán': 4, 'Arganzuela': 4,
  'Moncloa': 3, 'Hortaleza': 2, 'Carabanchel': 2, 'Vallecas': 2,
  'Usera': 1, 'Moratalaz': 1,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function spreadPoints(lat: number, lng: number, spread: number, count: number, weight: number) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
    const r = spread * (0.3 + Math.random() * 0.7);
    pts.push({ location: { lat: lat + r * Math.sin(angle), lng: lng + r * Math.cos(angle) }, weight });
  }
  pts.push({ location: { lat, lng }, weight: weight * 1.2 });
  return pts;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface ZoneCount { zone: string; count: number }
interface OpportunityFlag {
  property: Property;
  marketPriceM2: number;
  actualPriceM2: number;
  discountPct: number;
  savingsEur: number;
}

// Minimal Google Maps typings for script-loaded SDK
interface GLatLng { lat: number; lng: number }
interface GInfoWindow { open(m: GMap): void; close(): void }
interface GMarker { setMap(m: GMap | null): void; addListener(e: string, fn: () => void): void }
interface GHeatmapLayer { setMap(m: GMap | null): void; setData(d: unknown[]): void }
interface GMap {}
interface GMapsNS {
  Map: new (el: HTMLElement, opts: object) => GMap;
  LatLng: new (lat: number, lng: number) => GLatLng;
  Marker: new (opts: object) => GMarker;
  InfoWindow: new (opts: object) => GInfoWindow;
  visualization: { HeatmapLayer: new (opts: object) => GHeatmapLayer };
}
interface GWindow { maps: GMapsNS }
declare global {
  interface Window { google: GWindow; initMerofiseMap: () => void }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GMap | null>(null);
  const heatLayerRef = useRef<GHeatmapLayer | null>(null);
  const markersRef = useRef<GMarker[]>([]);
  const infoWindowRef = useRef<GInfoWindow | null>(null);

  const [zoneCounts, setZoneCounts] = useState<ZoneCount[]>([]);
  const [flags, setFlags] = useState<OpportunityFlag[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ── Build heatmap data from zone counts
  const buildHeatData = useCallback((zones: ZoneCount[]) => {
    const maxCount = Math.max(...zones.map(z => z.count), 1);
    const pts: { location: GLatLng; weight: number }[] = [];
    zones.forEach(({ zone, count }) => {
      const meta = ZONE_META[zone];
      if (!meta) return;
      const w = count / maxCount;
      spreadPoints(meta.lat, meta.lng, meta.spread, Math.max(4, Math.round(count * 3)), w)
        .forEach(p => pts.push(p));
    });
    return pts;
  }, []);

  // ── Refresh heatmap layer
  const updateHeatLayer = useCallback((zones: ZoneCount[]) => {
    if (!heatLayerRef.current || !window.google?.maps) return;
    const G = window.google.maps;
    const data = buildHeatData(zones).map(p => ({
      location: new G.LatLng(p.location.lat, p.location.lng),
      weight: p.weight,
    }));
    heatLayerRef.current.setData(data);
  }, [buildHeatData]);

  // ── Refresh opportunity markers
  const updateMarkers = useCallback((opportunityProps: OpportunityFlag[]) => {
    if (!window.google?.maps || !mapInstanceRef.current) return;
    const G = window.google.maps;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Close any open info window
    infoWindowRef.current?.close();

    opportunityProps.forEach(flag => {
      const meta = ZONE_META[flag.property.zone];
      if (!meta) return;

      // Slight random offset so overlapping pins don't stack exactly
      const jitterLat = (Math.random() - 0.5) * 0.004;
      const jitterLng = (Math.random() - 0.5) * 0.004;

      const marker = new G.Marker({
        position: { lat: meta.lat + jitterLat, lng: meta.lng + jitterLng },
        map,
        title: flag.property.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
              <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
              <path filter="url(#s)" d="M18 2C10.3 2 4 8.3 4 16c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z" fill="#16a34a"/>
              <circle cx="18" cy="16" r="9" fill="white" opacity="0.95"/>
              <text x="18" y="21" text-anchor="middle" font-size="13" font-weight="700" fill="#16a34a">$</text>
            </svg>
          `)}`,
          scaledSize: { width: 36, height: 44 } as unknown as GLatLng,
          anchor: { x: 18, y: 44 } as unknown as GLatLng,
        },
      });

      const diff = flag.discountPct.toFixed(1);
      const savings = Math.round(flag.savingsEur).toLocaleString('es-ES');
      const actualM2 = Math.round(flag.actualPriceM2).toLocaleString('es-ES');
      const marketM2 = Math.round(flag.marketPriceM2).toLocaleString('es-ES');
      const price = Math.round(flag.property.price).toLocaleString('es-ES');

      const infoWindow = new G.InfoWindow({
        content: `
          <div style="font-family:Inter,system-ui,sans-serif;padding:4px;min-width:230px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px">OPORTUNIDAD ${diff}% dto.</span>
            </div>
            <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:2px;line-height:1.3">${flag.property.title}</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:10px">${flag.property.address}${flag.property.zone ? ` · ${flag.property.zone}` : ''}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:#f9fafb;border-radius:8px;padding:8px">
                <div style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:2px">PRECIO</div>
                <div style="font-size:14px;font-weight:700;color:#111827">${price} €</div>
                <div style="font-size:10px;color:#6b7280">${actualM2} €/m²</div>
              </div>
              <div style="background:#f0fdf4;border-radius:8px;padding:8px;border:1px solid #bbf7d0">
                <div style="font-size:10px;color:#16a34a;font-weight:600;margin-bottom:2px">MERCADO ZONA</div>
                <div style="font-size:14px;font-weight:700;color:#15803d">${marketM2} €/m²</div>
                <div style="font-size:10px;color:#16a34a">Ahorras ${savings} €</div>
              </div>
            </div>
          </div>`,
      });

      marker.addListener('click', () => {
        infoWindowRef.current?.close();
        infoWindow.open(map);
        infoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);
    });
  }, []);

  // ── Main data fetch
  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, address, zone, price, area_m2, is_active')
      .eq('is_active', true);

    // ── Heatmap counts
    const baseCounts: Record<string, number> = { ...BASELINE_WEIGHTS };
    const isFallback = !data || error || data.length === 0;

    if (!isFallback) {
      data.forEach(p => {
        if (p.zone) baseCounts[p.zone] = (baseCounts[p.zone] || 0) + 3;
      });
    }
    const zones = Object.entries(baseCounts).map(([zone, count]) => ({ zone, count }));
    setZoneCounts(zones);
    setUsingFallback(isFallback);
    updateHeatLayer(zones);

    // ── Opportunity flags
    const opportunities: OpportunityFlag[] = [];
    if (!isFallback) {
      // Calculate average price/m² per zone from real data
      const zonePriceM2: Record<string, number[]> = {};
      data.forEach(p => {
        if (p.zone && p.price && p.area_m2 && p.area_m2 > 0) {
          if (!zonePriceM2[p.zone]) zonePriceM2[p.zone] = [];
          zonePriceM2[p.zone].push(p.price / p.area_m2);
        }
      });

      data.forEach(p => {
        if (!p.zone || !p.price || !p.area_m2 || p.area_m2 <= 0) return;
        const actualM2 = p.price / p.area_m2;

        // Use real zone average if available, else fall back to market reference
        const meta = ZONE_META[p.zone];
        const realAvg = zonePriceM2[p.zone]?.length > 1
          ? zonePriceM2[p.zone].reduce((a, b) => a + b, 0) / zonePriceM2[p.zone].length
          : null;
        const marketM2 = realAvg ?? meta?.marketPriceM2 ?? null;
        if (!marketM2) return;

        const discountPct = ((marketM2 - actualM2) / marketM2) * 100;
        if (discountPct >= 10) {
          opportunities.push({
            property: p as Property,
            marketPriceM2: marketM2,
            actualPriceM2: actualM2,
            discountPct,
            savingsEur: (marketM2 - actualM2) * p.area_m2,
          });
        }
      });
    }
    setFlags(opportunities);
    updateMarkers(opportunities);
    setLastUpdate(new Date());
  }, [updateHeatLayer, updateMarkers]);

  // ── Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('heatmap-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // ── Load Google Maps script
  useEffect(() => {
    if (document.getElementById('google-maps-script')) {
      if (window.google?.maps) initMap();
      return;
    }
    window.initMerofiseMap = initMap;
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&callback=initMerofiseMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { window.initMerofiseMap = () => {}; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;
    const G = window.google.maps;

    const map = new G.Map(mapRef.current, {
      center: { lat: 40.4168, lng: -3.7038 },
      zoom: 12,
      styles: [
        { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
        { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfdbfe' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
        { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#cbd5e1' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d1fae5' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#94a3b8' }, { weight: 1 }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    heatLayerRef.current = new G.visualization.HeatmapLayer({
      data: [],
      map,
      radius: 45,
      opacity: 0.78,
      gradient: [
        'rgba(0,0,0,0)',
        'rgba(34,197,94,0.5)',
        'rgba(34,197,94,0.85)',
        'rgba(132,204,22,1)',
        'rgba(234,179,8,1)',
        'rgba(249,115,22,1)',
        'rgba(239,68,68,1)',
        'rgba(220,38,38,1)',
        'rgba(153,27,27,1)',
      ],
    });

    fetchData();
  }

  // ── Derived display values
  const topZones = [...zoneCounts].sort((a, b) => b.count - a.count).slice(0, 8);
  const maxCount = Math.max(...topZones.map(z => z.count), 1);

  function demandInfo(count: number) {
    const r = count / maxCount;
    if (r >= 0.7) return { label: 'Alta', color: '#ef4444' };
    if (r >= 0.4) return { label: 'Media', color: '#f59e0b' };
    return { label: 'Baja', color: '#22c55e' };
  }

  return (
    <section style={{ padding: '80px 0', background: '#0f172a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(147,197,253,0.25)', borderRadius: 999, padding: '5px 14px' }}>
              <span style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {usingFallback ? 'Datos de mercado estimados' : 'Datos en tiempo real · Supabase'}
              </span>
            </div>
            {lastUpdate && (
              <span style={{ fontSize: 12, color: '#475569' }}>
                Actualizado: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 12 }}>
            Zonas Calientes de Madrid
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 600, lineHeight: 1.7 }}>
            {usingFallback
              ? 'Visualizacion basada en datos del mercado inmobiliario 2024–2025. Se actualizara automaticamente con tus propiedades reales.'
              : 'Densidad de demanda en tiempo real. Las banderas verdes marcan oportunidades con precio por debajo del mercado.'}
          </p>
        </div>

        {/* ── Opportunity alert bar */}
        {flags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 14, padding: '12px 18px', marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18 }}>$</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>
              {flags.length} oportunidad{flags.length > 1 ? 'es' : ''} detectada{flags.length > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 13, color: '#86efac' }}>
              Propiedades por debajo del precio de mercado de su zona · Haz clic en las banderas verdes del mapa
            </span>
          </div>
        )}

        {/* ── Map */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div ref={mapRef} style={{ width: '100%', height: 540 }} />

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', minWidth: 210 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Indice de demanda</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {[
                { gradient: 'linear-gradient(to right, #991b1b, #dc2626, #ef4444)', label: 'Alta demanda' },
                { gradient: 'linear-gradient(to right, #f97316, #eab308)', label: 'Demanda media' },
                { gradient: 'linear-gradient(to right, #22c55e, #84cc16)', label: 'Oportunidad' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 9, borderRadius: 5, background: item.gradient, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="20" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2C10.3 2 4 8.3 4 16c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z" fill="#16a34a"/>
                <circle cx="18" cy="16" r="9" fill="white" opacity="0.95"/>
                <text x="18" y="21" textAnchor="middle" fontSize="13" fontWeight="700" fill="#16a34a">$</text>
              </svg>
              <span style={{ fontSize: 12, color: '#86efac' }}>Precio bajo mercado (-10%+)</span>
            </div>
          </div>

          {/* Live / fallback badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: usingFallback ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 12px', border: `1px solid ${usingFallback ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: usingFallback ? '#eab308' : '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: usingFallback ? '#fde68a' : '#86efac', fontWeight: 600 }}>
              {usingFallback ? 'Mercado estimado' : 'Supabase Live'}
            </span>
          </div>
        </div>

        {/* ── Opportunity flag cards */}
        {flags.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>$</span> Oportunidades detectadas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {flags.map(flag => (
                <div key={flag.property.id} style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.35 }}>{flag.property.title}</div>
                    <span style={{ background: '#16a34a', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      -{flag.discountPct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{flag.property.address}{flag.property.zone ? ` · ${flag.property.zone}` : ''}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Precio', value: `${Math.round(flag.property.price).toLocaleString('es-ES')} €`, color: 'white' },
                      { label: 'Mercado/m²', value: `${Math.round(flag.marketPriceM2).toLocaleString('es-ES')} €`, color: '#94a3b8' },
                      { label: 'Ahorro', value: `${Math.round(flag.savingsEur).toLocaleString('es-ES')} €`, color: '#4ade80' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 2 }}>{stat.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Zone heatmap cards */}
        {topZones.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', marginBottom: 14 }}>Indice por zona</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {topZones.map(zone => {
                const d = demandInfo(zone.count);
                const pct = Math.round((zone.count / maxCount) * 100);
                return (
                  <div key={zone.zone}
                    style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{zone.zone}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.color, background: `${d.color}22`, padding: '2px 8px', borderRadius: 999 }}>{d.label}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 4, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right, ${d.color}99, ${d.color})`, borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{pct}% indice de demanda</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
