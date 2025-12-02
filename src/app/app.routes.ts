import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registrar-usuario',
    loadComponent: () =>
      import('./pages/registrar-usuario/registrar-usuario.page').then(
        (m) => m.RegistrarUsuarioPage
      ),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'cliente-detalle/:id',
    loadComponent: () =>
      import('./pages/clientes-detalle/clientes-detalle.page').then(
        (m) => m.ClientesDetallePage
      ),
  },
  {
    path: 'cuentas',
    loadComponent: () =>
      import('./pages/cuentas/cuentas.page').then((m) => m.CuentasPage),
  },

  {
    path: 'abrir-cuenta',
    loadComponent: () =>
      import('./pages/abrir-cuenta/abrir-cuenta.page').then(
        (m) => m.AbrirCuentaPage
      ),
  },

  {
    path: 'beneficiarios',
    loadComponent: () =>
      import('./pages/beneficiarios/beneficiarios.page').then(
        (m) => m.BeneficiariosPage
      ),
  },

  {
    path: 'transferencias',
    loadComponent: () =>
      import('./pages/transferencias/transferencias.page').then(
        (m) => m.TransferenciasPage
      ),
  },

  {
    path: 'pagos-servicio',
    loadComponent: () =>
      import('./pages/pagos-servicio/pagos-servicio.page').then(
        (m) => m.PagosServicioPage
      ),
  },

  {
    path: 'proveedores-servicio',
    loadComponent: () =>
      import('./pages/proveedores-servicio/proveedores-servicio.page').then(
        (m) => m.ProveedoresServicioPage
      ),
  },

  {
    path: 'transferencias-programadas',
    loadComponent: () =>
      import(
        './pages/transferencias-programadas/transferencias-programadas.page'
      ).then((m) => m.TransferenciasProgramadasPage),
  },
  {
    path: 'admin-menu',
    loadComponent: () =>
      import('./pages/admin-menu/admin-menu.page').then((m) => m.AdminMenuPage),
  },
  {
    path: 'menu-cliente',
    loadComponent: () =>
      import('./pages/menu-cliente/menu-cliente.page').then(
        (m) => m.MenuClientePage
      ),
  },

  {
    path: 'mis-cuentas',
    loadComponent: () =>
      import('./pages/mis-cuentas/mis-cuentas.page').then(
        (m) => m.MisCuentasPage
      ),
  },

  {
    path: 'mis-cuentas',
    loadComponent: () =>
      import('./pages/mis-cuentas/mis-cuentas.page').then(
        m => m.MisCuentasPage
      ),
  },


  {
    path: 'menu-gestor',
    loadComponent: () =>
      import('./pages/menu-gestor/menu-gestor.page').then(
        (m) => m.MenuGestorPage
      ),
  },

  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/historial/historial.page').then((m) => m.HistorialPage),
  },

  {
    path: 'reportes',
    loadComponent: () =>
      import('./pages/reportes/reportes.page').then((m) => m.ReportesPage),
  },
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./pages/auditoria/auditoria.page').then((m) => m.AuditoriaPage),
  },

];
