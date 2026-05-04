import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://merofise.es'),
  title: 'Propiedades Exclusivas Madrid | Herencias, Divorcios y Embargos | Merofise',
  description: 'Merofise: accede a propiedades exclusivas en Madrid procedentes de herencias, divorcios y embargos bancarios. Precios muy por debajo del mercado. Asesoramiento integral gratuito.',
  keywords: 'inmobiliaria Madrid, propiedades herencia, piso divorcio Madrid, embargo bancario vivienda, comprar piso barato Madrid, Merofise',
  authors: [{ name: 'Merofise', url: 'https://merofise.es' }],
  creator: 'Merofise',
  publisher: 'Merofise',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://merofise.es',
    siteName: 'Merofise Inmobiliaria',
    title: 'Propiedades Exclusivas Madrid | Herencias, Divorcios y Embargos | Merofise',
    description: 'Propiedades únicas en Madrid procedentes de herencias, divorcios y embargos. Precios exclusivos. Asesoramiento gratuito.',
    images: [{ url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', width: 1200, height: 630, alt: 'Merofise Inmobiliaria Madrid' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propiedades Exclusivas Madrid | Merofise',
    description: 'Propiedades únicas en Madrid procedentes de herencias, divorcios y embargos. Precios exclusivos.',
    images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Merofise',
              description: 'Inmobiliaria especializada en propiedades exclusivas de herencias, divorcios y embargos en Madrid',
              url: 'https://merofise.es',
              telephone: '+34664037407',
              email: 'info@merofise.es',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Calle Lagasca 36',
                addressLocality: 'Madrid',
                postalCode: '28001',
                addressCountry: 'ES',
              },
              openingHours: 'Mo-Fr 09:00-20:00',
              priceRange: '€€€',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
