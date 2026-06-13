import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) { router.navigate(['/login']); return false; }
  const need = route.data['role'];
  if (need && role !== need) {
    const map: Record<string, string> = { user: '/user', operator: '/operator', admin: '/admin' };
    router.navigate([map[role || ''] || '/login']);
    return false;
  }
  return true;
};
