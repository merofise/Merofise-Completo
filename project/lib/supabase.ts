import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  zone: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  property_type: string;
  status: string;
  badge: string;
  images: string[];
  features: string[];
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type Visit = {
  id: string;
  property_id: string;
  property_title: string;
  visit_date: string;
  visit_time: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  status: string;
  notes: string;
  created_at: string;
};

export type Offer = {
  id: string;
  property_id: string;
  property_title: string;
  property_price: number;
  offer_type: string;
  offered_price: number | null;
  buyer_name: string;
  buyer_dni: string;
  buyer_email: string;
  buyer_phone: string;
  arras_total: number;
  arras_owner: number;
  arras_merofise: number;
  honorarios: number;
  honorarios_iva: number;
  rest_notary: number;
  status: string;
  contract_generated: boolean;
  invoice_number: string;
  created_at: string;
};
