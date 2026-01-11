/**
 * CORS utilities for Edge Functions
 * Restricts cross-origin requests to allowed domains only
 */

// List of allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://healthswift.app',
  'https://www.healthswift.app',
  // Lovable preview domains - pattern match handled separately
];

// Check if origin matches Lovable preview pattern
const isLovablePreview = (origin: string): boolean => {
  // Matches: https://*.lovable.app or https://*.lovableproject.com
  return /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin) ||
         /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin);
};

// Check if origin is localhost for development
const isLocalhost = (origin: string): boolean => {
  return /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
         /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
};

/**
 * Get CORS headers based on the request origin
 * Returns restrictive CORS headers that only allow whitelisted origins
 */
export const getCorsHeaders = (request: Request): Record<string, string> => {
  const origin = request.headers.get('origin') || '';
  
  // Check if origin is allowed
  const isAllowed = 
    ALLOWED_ORIGINS.includes(origin) ||
    isLovablePreview(origin) ||
    isLocalhost(origin);
  
  // Use the requesting origin if allowed, otherwise use a safe default
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0] || 'https://healthswift.app';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

/**
 * Validate that the request origin is allowed
 * Returns true if the origin is in the whitelist
 */
export const isOriginAllowed = (request: Request): boolean => {
  const origin = request.headers.get('origin') || '';
  
  return ALLOWED_ORIGINS.includes(origin) ||
         isLovablePreview(origin) ||
         isLocalhost(origin);
};
