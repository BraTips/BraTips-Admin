import { defineStore } from 'pinia';
import { router } from '@/router';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
    accessToken: localStorage.getItem('accessToken') || '',
    returnUrl: null as string | null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    async login(email: string, password: string) {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
      const payload = data.data || data;
      if (payload.user?.role !== 'admin') throw new Error('This account does not have administrator access.');
      this.user = payload.user;
      this.accessToken = payload.accessToken;
      localStorage.setItem('adminUser', JSON.stringify(this.user));
      localStorage.setItem('accessToken', this.accessToken);
      await router.push(this.returnUrl || '/dashboard');
    },
    async refresh() {
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Session expired. Please sign in again.');
      const payload = data.data || data;
      if (payload.user?.role !== 'admin' || !payload.accessToken) throw new Error('Administrator session could not be refreshed. Please sign in again.');
      this.user = payload.user;
      this.accessToken = payload.accessToken;
      localStorage.setItem('adminUser', JSON.stringify(this.user));
      localStorage.setItem('accessToken', this.accessToken);
      return this.user;
    },
    async me() {
      if (!this.accessToken) return null;
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        credentials: 'include'
      });
      if (!res.ok) { this.logout(false); return null; }
      const data = await res.json();
      this.user = data.data?.user || data.user || data;
      localStorage.setItem('adminUser', JSON.stringify(this.user));
      return this.user;
    },
    async logout(redirect = true) {
      try {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
          credentials: 'include'
        });
      } catch {}
      this.user = null;
      this.accessToken = '';
      localStorage.removeItem('adminUser');
      localStorage.removeItem('accessToken');
      if (redirect) await router.push('/login');
    }
  }
});
