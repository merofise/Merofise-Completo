/*
  # Merofise Inmobiliaria - Schema inicial

  1. Nuevas tablas
    - `properties`: Propiedades inmobiliarias con todos sus datos
    - `visits`: Solicitudes de visita a propiedades
    - `offers`: Ofertas de compra con estado y precio
    - `invoices`: Facturas generadas con numeración automática

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para lectura pública de propiedades
    - Políticas para inserción autenticada y pública (formularios)
*/

-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'Madrid',
  zone text DEFAULT '',
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area_m2 numeric DEFAULT 0,
  property_type text DEFAULT 'piso',
  status text DEFAULT 'disponible',
  badge text DEFAULT '',
  images text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  owner_name text DEFAULT '',
  owner_phone text DEFAULT '',
  owner_email text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can insert properties"
  ON properties FOR INSERT
  WITH CHECK (true);

-- Tabla de visitas
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  property_title text DEFAULT '',
  visit_date date NOT NULL,
  visit_time time NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  status text DEFAULT 'pendiente',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits"
  ON visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

-- Tabla de ofertas/compras
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  property_title text DEFAULT '',
  property_price numeric DEFAULT 0,
  offer_type text NOT NULL DEFAULT 'negotiate',
  offered_price numeric,
  buyer_name text NOT NULL,
  buyer_dni text NOT NULL,
  buyer_email text DEFAULT '',
  buyer_phone text DEFAULT '',
  arras_total numeric DEFAULT 0,
  arras_owner numeric DEFAULT 0,
  arras_merofise numeric DEFAULT 0,
  honorarios numeric DEFAULT 0,
  honorarios_iva numeric DEFAULT 0,
  rest_notary numeric DEFAULT 0,
  status text DEFAULT 'pendiente',
  contract_generated boolean DEFAULT false,
  invoice_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert offers"
  ON offers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view offers"
  ON offers FOR SELECT
  TO authenticated
  USING (true);

-- Tabla de facturas con numeración automática
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  buyer_dni text DEFAULT '',
  property_title text DEFAULT '',
  property_price numeric DEFAULT 0,
  honorarios numeric DEFAULT 0,
  iva numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

-- Secuencia para numeración de facturas
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  year_part text;
BEGIN
  next_num := nextval('invoice_seq');
  year_part := EXTRACT(YEAR FROM now())::text;
  RETURN 'MER-' || year_part || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Insertar propiedades de ejemplo
INSERT INTO properties (title, description, price, address, city, zone, bedrooms, bathrooms, area_m2, property_type, badge, images, features, is_featured, is_active) VALUES
(
  'Ático de lujo en Salamanca con terraza',
  'Espectacular ático en pleno barrio de Salamanca con terraza panorámica de 80m². Procedente de herencia, oportunidad única de adquisición. Reformado completamente con materiales de primera calidad, domótica integrada y vistas a la capital.',
  895000,
  'Calle Lagasca 45, 28001 Madrid',
  'Madrid',
  'Salamanca',
  4,
  3,
  220,
  'atico',
  'EXCLUSIVA',
  ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg'],
  ARRAY['Terraza 80m²', 'Domótica', 'Garaje x2', 'Trastero', 'Portero 24h', 'Aire acondicionado'],
  true,
  true
),
(
  'Piso en Retiro - Divorcio con urgencia',
  'Piso amplio en el exclusivo barrio del Retiro, se vende con urgencia por proceso de divorcio. Gran oportunidad de inversión, precio muy por debajo del mercado. Luminoso, reformado y en planta alta.',
  420000,
  'Calle Ibiza 22, 28009 Madrid',
  'Madrid',
  'Retiro',
  3,
  2,
  145,
  'piso',
  'URGENTE',
  ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', 'https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg'],
  ARRAY['Reformado 2023', 'Parqué original', 'Cocina equipada', 'Armarios empotrados', 'Vistas al parque'],
  true,
  true
),
(
  'Chalet adosado en Pozuelo - Embargo bancario',
  'Chalet adosado de 4 habitaciones en la mejor zona residencial de Pozuelo. Procedente de embargo bancario, precio de oportunidad excepcional. Jardín privado, piscina comunitaria, garaje doble.',
  550000,
  'Urbanización La Finca, Pozuelo de Alarcón',
  'Pozuelo de Alarcón',
  'La Finca',
  4,
  3,
  280,
  'chalet',
  'MARGEN',
  ARRAY['https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
  ARRAY['Jardín privado 150m²', 'Piscina comunitaria', 'Garaje doble', 'Trastero', 'Zona spa', 'Seguridad 24h'],
  true,
  true
),
(
  'Estudio renovado en Malasaña',
  'Estudio completamente reformado en el trendy barrio de Malasaña. Perfecto para inversión o residencia. Procedente de herencia, documentación completa y lista para firmar. Alta rentabilidad por alquiler.',
  189000,
  'Calle Fuencarral 88, 28004 Madrid',
  'Madrid',
  'Malasaña',
  1,
  1,
  45,
  'estudio',
  'EXCLUSIVA',
  ARRAY['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'],
  ARRAY['Reformado integral', 'Electrodomésticos incluidos', 'Alta eficiencia energética', 'Fibra óptica'],
  false,
  true
),
(
  'Piso familiar en Chamartín - Herencia',
  'Amplio piso familiar en Chamartín, 4 habitaciones. Procedente de herencia con precio negociable. Amplio salón-comedor, cocina independiente, habitaciones luminosas y dos terrazas.',
  680000,
  'Calle Arturo Soria 120, 28027 Madrid',
  'Madrid',
  'Chamartín',
  4,
  2,
  175,
  'piso',
  'MARGEN',
  ARRAY['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg'],
  ARRAY['Dos terrazas', 'Cocina americana', 'Zona noble', 'Portero físico', 'Garaje opcional'],
  false,
  true
),
(
  'Loft industrial en Lavapiés',
  'Espectacular loft de estilo industrial en pleno Lavapiés, zona de alta revalorización. Techos de 4 metros, vigas vistas, gran espacio diáfano. Oportunidad única procedente de liquidación empresarial.',
  295000,
  'Calle Valencia 18, 28012 Madrid',
  'Madrid',
  'Lavapiés',
  2,
  1,
  90,
  'loft',
  'URGENTE',
  ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
  ARRAY['Techos 4m', 'Vigas vistas', 'Suelo pulido', 'Gran ventanal', 'Zona artística'],
  false,
  true
)
ON CONFLICT DO NOTHING;
