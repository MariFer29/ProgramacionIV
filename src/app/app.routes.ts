import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registrar-usuario',
    loadComponent: () => import('./pages/registrar-usuario/registrar-usuario.page').then(m => m.RegistrarUsuarioPage)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.page').then(m => m.ClientesPage)
  },
  {
    path: 'cliente-detalle/:id',
    loadComponent: () =>
      import('./pages/clientes-detalle/clientes-detalle.page').then(m => m.ClientesDetallePage)
  }
];

