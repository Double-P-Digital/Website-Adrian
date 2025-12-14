import { MetadataRoute } from 'next'

const siteUrl = 'https://dailyguest.online'

// Funcție helper pentru a genera handle din nume
function generateHandle(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return slug || id
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pagini statice - mereu disponibile
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/stay-categories/all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/stay-categories/cluj-napoca`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/stay-categories/baia-mare`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/stay-categories/oradea`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  // Pagini apartamente - încărcate dinamic
  let apartmentPages: MetadataRoute.Sitemap = []
  try {
    // Import dinamic pentru a evita probleme la build time
    const { getAllApartments } = await import('@/services/apartments')
    const apartments = await getAllApartments()
    
    if (Array.isArray(apartments) && apartments.length > 0) {
      apartmentPages = apartments
        .filter((apt) => apt && (apt.name || apt.id)) // Filtrează apartamente invalide
        .map((apt) => ({
          url: `${siteUrl}/stay-listings/${generateHandle(apt.name || '', apt.id)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    }
  } catch {
    // Ignoră erori - sitemap-ul va conține doar paginile statice
  }

  return [...staticPages, ...apartmentPages]
}

