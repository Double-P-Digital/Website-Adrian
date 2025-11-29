/**
 * Image URL validation and sanitization utilities
 */

/**
 * Validates if a string is a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a relative path (starts with /)
  if (url.startsWith('/')) return true
  
  // Check if it's a data URL
  if (url.startsWith('data:')) return true
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Sanitizes and validates an image URL
 * Returns a valid URL or a placeholder
 */
export function sanitizeImageUrl(url: string | null | undefined, placeholder: string = '/images/placeholder.jpg'): string {
  if (!url || typeof url !== 'string') return placeholder
  
  // If it's already a valid relative path, return it
  if (url.startsWith('/')) return url
  
  // If it's a data URL, return it
  if (url.startsWith('data:')) return url
  
  // Try to validate as absolute URL
  try {
    const parsedUrl = new URL(url)
    // Check if protocol is http or https
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return url
    }
  } catch {
    // Invalid URL format
  }
  
  // If URL is invalid, return placeholder
  return placeholder
}

/**
 * Processes an array of image URLs, filtering out invalid ones
 */
export function sanitizeImageUrls(urls: (string | null | undefined)[], placeholder: string = '/images/placeholder.jpg'): string[] {
  if (!Array.isArray(urls) || urls.length === 0) {
    return [placeholder]
  }
  
  const validUrls = urls
    .map(url => sanitizeImageUrl(url, placeholder))
    .filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
  
  return validUrls.length > 0 ? validUrls : [placeholder]
}

/**
 * Gets a high-quality version of a Cloudinary image URL for full-screen display
 * Adds quality and format parameters for maximum clarity
 */
export function getHighQualityImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  
  // If it's a Cloudinary URL, add quality parameters
  if (url.includes('cloudinary.com')) {
    // Check if URL already has transformation parameters
    const uploadIndex = url.indexOf('/upload/')
    if (uploadIndex === -1) return url
    
    const beforeUpload = url.substring(0, uploadIndex + 8) // '/upload/'
    const afterUpload = url.substring(uploadIndex + 8)
    
    // If there are already transformations, check if quality is set
    if (afterUpload.includes('/')) {
      // Check if quality parameter exists
      if (afterUpload.includes('q_')) {
        // Replace existing quality with best
        return url.replace(/q_[^\/]+/, 'q_auto:best')
      } else {
        // Add quality parameter before the first slash
        const firstSlash = afterUpload.indexOf('/')
        if (firstSlash > 0) {
          return `${beforeUpload}q_auto:best,f_auto/${afterUpload}`
        } else {
          return `${beforeUpload}q_auto:best,f_auto/${afterUpload}`
        }
      }
    } else {
      // No transformations, add quality parameters
      return `${beforeUpload}q_auto:best,f_auto/${afterUpload}`
    }
  }
  
  return url
}

