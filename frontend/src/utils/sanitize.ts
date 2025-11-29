/**
 * Sanitization utilities for preventing XSS attacks
 * DO NOT use dangerouslySetInnerHTML without sanitizing first
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML string to prevent XSS (fallback for server-side)
 * For client-side, use DOMPurify instead
 */
function sanitizeHtmlBasic(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  return sanitized
}

/**
 * Escape HTML special characters
 * Use this when you need to display user input as plain text
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return ''
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Safe way to render HTML content
 * Returns sanitized HTML that can be used with dangerouslySetInnerHTML
 * Uses DOMPurify for client-side (production-ready)
 * Falls back to basic sanitization for server-side
 */
export function safeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Use DOMPurify in browser environment (client-side)
  if (typeof window !== 'undefined') {
    try {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
      })
    } catch (error) {
      console.error('[Sanitize] DOMPurify error:', error)
      // Fallback to basic sanitization if DOMPurify fails
      return sanitizeHtmlBasic(html)
    }
  }
  
  // Fallback for server-side rendering
  return sanitizeHtmlBasic(html)
}

