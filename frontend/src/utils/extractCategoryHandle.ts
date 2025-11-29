/**
 * Extract category handle from a location string (city or address)
 * @param location - City name or address string
 * @returns Normalized category handle (e.g., "cluj-napoca", "baia-mare")
 */
export function extractCategoryHandleFromLocation(location?: string): string {
  if (!location) return 'all'
  const city = location.includes(',') 
    ? location.split(',')[0]?.trim().toLowerCase()
    : location.trim().toLowerCase()

  if (!city) return 'all'
  return city.replace(/\s+/g, '-')
}

/**
 * Extract category handle from apartment (prefers city, falls back to address)
 * @param apartment - Apartment object with city and/or address
 * @returns Normalized category handle
 */
export function extractCategoryHandleFromApartment(apartment: { city?: string; address?: string }): string {
  if (apartment.city) {
    return extractCategoryHandleFromLocation(apartment.city)
  }
  return extractCategoryHandleFromLocation(apartment.address)
}

