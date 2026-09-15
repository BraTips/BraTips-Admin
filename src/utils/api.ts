import { useAuthStore } from '@/stores/auth';

export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function apiFetch(path: string, options: RequestInit = {}, timeoutMs = 15000) {
  const auth = useAuthStore();
  const request = async (token: string, requestTimeoutMs: number) => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      return await fetch(`${apiUrl}${path}`, { ...options, headers, credentials: 'include', signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  try {
    let response: Response;
    try {
      response = await request(auth.accessToken, timeoutMs);
    } catch (error: any) {
      if (error?.name === 'AbortError') throw new Error('The request timed out. The server may still be processing this operation.');
      throw error;
    }

    // Access tokens are short-lived. Use the httpOnly refresh session once before
    // forcing the administrator back to the login screen.
    if (response.status === 401 && auth.accessToken) {
      try {
        await auth.refresh();
        response = await request(auth.accessToken, timeoutMs);
      } catch (refreshError: any) {
        await auth.logout();
        throw new Error(refreshError?.message || 'Your admin session has expired. Please sign in again.');
      }
    }

    if (response.status === 403) {
      throw new Error('You are signed in, but your account does not have administrator permission for this action.');
    }

    const text = await response.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; }
    catch { data = { message: text || 'Request failed' }; }
    if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
    return data.data ?? data;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('The request timed out. The server may still be processing this operation.');
    throw error;
  }
}
