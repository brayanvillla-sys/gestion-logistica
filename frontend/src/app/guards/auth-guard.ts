import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.autenticado()) return true;

  router.navigate(['/login']);
  return false;
};

export const rolGuard = (...roles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    const rol = auth.rol();
    if (rol && roles.includes(rol)) return true;

    router.navigate(['/']);
    return false;
  };
};