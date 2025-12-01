// Central API configuration
// Change `VITE_API_BASE` in your environment or this default to point the app to another backend
export const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || '';

// Simple explicit endpoint export for convenience.
// Falls back to localhost if VITE_API_BASE is not provided.
export const api_endpoint = API_BASE || 'https://api.lrpm.space/api';

/**
 * Build a full API URL from a path. Keeps a single place to change the backend base URL.
 * Usage: api('/auth/register') -> 'https://api.example.com/auth/register'
 */
export function api(path: string) {
  if (!path) return API_BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export default api;
