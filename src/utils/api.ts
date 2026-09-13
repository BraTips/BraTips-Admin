import { useAuthStore } from '@/stores/auth';

export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const auth = useAuthStore();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`);
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401 || response.status === 403) {
    // Let the router/auth state handle access loss.
    if (response.status === 401) await auth.logout();
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data.data ?? data;
}
