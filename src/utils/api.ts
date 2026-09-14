import { useAuthStore } from '@/stores/auth';

export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function apiFetch(path: string, options: RequestInit = {}, timeoutMs = 15000) {
  const auth = useAuthStore();
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  headers.set('Content-Type', 'application/json');
  if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`);
  try {
    const response = await fetch(`${apiUrl}${path}`, { ...options, headers, credentials: 'include', signal: controller.signal });
    if (response.status === 401 || response.status === 403) {
      // Let the router/auth state handle access loss.
      if (response.status === 401) await auth.logout();
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
    return data.data ?? data;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('The request timed out. Check the email service and try again.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
