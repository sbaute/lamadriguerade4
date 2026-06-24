import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
    title: ' La Madriguera - Catálogo 🐰'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    title: ' La Madriguera - Login 🐰'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    title: ' La Madriguera - Admin 🐰'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
