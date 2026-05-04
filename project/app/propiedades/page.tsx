import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import PropiedadesClient from './PropiedadesClient';

export const revalidate = 30;

export const metadata = {
  title: 'Propiedades en Madrid | Herencias, Divorcios y Embargos | Merofise',
  description: 'Explora todas las propiedades exclusivas en Madrid disponibles en Merofise. Pisos, áticos, chalets y más procedentes de herencias, divorcios y embargos.',
};

export default async function PropiedadesPage() {
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#6b7280' }}>Cargando propiedades...</div>}>
      <PropiedadesClient allProperties={properties || []} />
    </Suspense>
  );
}
