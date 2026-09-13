import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [MainRoutes, PublicRoutes, { path: '/:pathMatch(.*)*', redirect: '/dashboard' }]
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth) {
    if (!auth.isAuthenticated) {
      auth.returnUrl = to.fullPath;
      return next('/login');
    }
    if (!auth.user) await auth.me();
    if (!auth.user || auth.user.role !== 'admin') {
      await auth.logout(false);
      return next('/login');
    }
  }
  if (to.path === '/login' && auth.isAuthenticated && auth.user?.role === 'admin') return next('/dashboard');
  next();
});

router.beforeEach(() => { useUIStore().isLoading = true; });
router.afterEach(() => { useUIStore().isLoading = false; });
