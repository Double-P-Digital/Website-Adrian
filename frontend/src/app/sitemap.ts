import { MetadataRoute } from 'next'
import { getAllApartments } from '@/services/apartments'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://dailyguest.online'
  
  // Pagini statice
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

  // Pagini apartamente
  let apartmentPages: MetadataRoute.Sitemap = []
  try {
    const apartments = await getAllApartments()
    apartmentPages = apartments.map((apt: any) => ({
      url: `${siteUrl}/stay-listings/${apt.handle || apt.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Ignoră erori
  }

  return [...staticPages, ...apartmentPages]
}

