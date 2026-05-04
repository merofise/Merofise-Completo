import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://merofise.es', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://merofise.es/propiedades', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://merofise.es/publicar', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
