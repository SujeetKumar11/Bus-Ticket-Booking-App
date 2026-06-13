import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot', loadComponent: () => import('./pages/forgot/forgot.component').then(m => m.ForgotComponent) },
  { path: 'user', loadComponent: () => import('./pages/user/user.component').then(m => m.UserComponent), canActivate: [authGuard], data: { role: 'user' } },
  { path: 'operator', loadComponent: () => import('./pages/operator/operator.component').then(m => m.OperatorComponent), canActivate: [authGuard], data: { role: 'operator' } },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard], data: { role: 'admin' } }
];
