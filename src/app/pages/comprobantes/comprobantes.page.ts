import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import {
  Cuenta,
  MovimientoHistorial,
  HistorialFiltro,
} from 'src/app/models/banca.models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-comprobantes',
  templateUrl: './comprobantes.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ComprobantesPage implements OnInit {
  cuentas: Cuenta[] = [];
  comprobantes: MovimientoHistorial[] = [];

  cuentaSeleccionadaId: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  tipoSeleccionado: string = ''; // '' | '1' | '2'
  estadoCodigo: string = '';

  loading = false;

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
  }

  // =============== UTILIDAD TOKEN =================
  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      console.warn('No se pudo decodificar el token en Comprobantes');
      return null;
    }
  }

  // Normaliza lo que venga a yyyy-MM-dd para el backend (.NET)
  private normalizarFecha(
    valor: string | null | undefined
  ): string | undefined {
    if (!valor) return undefined;

    // Ya viene como yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }

    // dd/MM/yyyy o dd-MM-yyyy
    const match = valor.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      const dd = d.padStart(2, '0');
      const mm = m.padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    }

    // Cualquier otra cosa: último intento con Date
    const date = new Date(valor);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    console.warn('Fecha en formato no reconocido (Comprobantes):', valor);
    return undefined;
  }

  // =============== CARGAR CUENTAS =================
  cargarCuentas(): void {
    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    console.log('PAYLOAD TOKEN (Comprobantes):', payload);

    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    let obs$;

    if (rol === 'cliente') {
      if (Number.isNaN(clienteId) || clienteId <= 0) {
        console.warn(
          'Rol cliente pero sin clienteId válido en el token. No se cargan cuentas (Comprobantes).'
        );
        this.cuentas = [];
        this.mostrarToast(
          'No se pudo identificar el cliente desde el token.',
          'danger'
        );
        return;
      }

      // Cliente -> solo sus cuentas
      obs$ = this.api.getCuentas(clienteId);
    } else {
      // Admin / Gestor -> todas
      obs$ = this.api.getCuentas();
    }

    obs$.subscribe({
      next: (data) => {
        console.log('CUENTAS COMPROBANTES:', data);
        this.cuentas = data;

        // Si solo hay una cuenta, la preseleccionamos
        if (this.cuentas.length === 1) {
          this.cuentaSeleccionadaId = this.cuentas[0].id as any;
        }
      },
      error: (err) => {
        console.error('Error al cargar cuentas en Comprobantes:', err);
        this.mostrarToast('Error al cargar cuentas', 'danger');
      },
    });
  }

  // =============== BUSCAR COMPROBANTES =================
  buscar(): void {
    if (!this.cuentaSeleccionadaId) {
      this.mostrarToast('Seleccione una cuenta.');
      return;
    }

    const desdeNormalizado = this.normalizarFecha(this.fechaDesde);
    const hastaNormalizado = this.normalizarFecha(this.fechaHasta);

    const filtrosBase: HistorialFiltro = {
      desde: desdeNormalizado,
      hasta: hastaNormalizado,
      // NO enviamos tipo; filtramos en front
      estado: this.estadoCodigo ? Number(this.estadoCodigo) : undefined,
    };

    const token = localStorage.getItem('token') || '';
    const payload = token ? this.decodeToken(token) : null;
    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    if (Number.isNaN(clienteId) || clienteId <= 0) {
      this.mostrarToast(
        'No se pudo identificar el cliente desde el token.',
        'danger'
      );
      return;
    }

    this.loading = true;
    this.comprobantes = [];

    console.log('BUSCAR COMPROBANTES → clienteId:', clienteId);
    console.log('BUSCAR COMPROBANTES → filtros (sin tipo):', filtrosBase);
    console.log(
      'BUSCAR COMPROBANTES → cuentaId:',
      this.cuentaSeleccionadaId || null
    );

    this.api
      .getHistorialPorCliente(clienteId, {
        ...filtrosBase,
        cuentaId: this.cuentaSeleccionadaId || null,
      })
      .subscribe({
        next: (data) => {
          this.loading = false;
          const rawData: any[] = data || [];
          console.log('RESPUESTA COMPROBANTES (RAW):', rawData);

          // Solo tomamos movimientos que puedan tener comprobante:
          // Transferencia o PagoServicio con su respectivo Id
          let result = rawData.filter(
            (m) =>
              (m.tipo === 'Transferencia' && m.transferenciaId) ||
              (m.tipo === 'PagoServicio' && m.pagoServicioId)
          );

          // Filtro por tipo en front
          if (this.tipoSeleccionado === '1') {
            result = result.filter((m) => m.tipo === 'Transferencia');
          } else if (this.tipoSeleccionado === '2') {
            result = result.filter((m) => m.tipo === 'PagoServicio');
          }

          console.log('COMPROBANTES (filtrados):', result);
          this.comprobantes = result;
        },
        error: (err) => {
          console.error('Error al obtener comprobantes:', err);
          this.loading = false;
          this.mostrarToast(
            err.error?.message ||
              err.error?.mensaje ||
              'Error al obtener los comprobantes.',
            'danger'
          );
        },
      });
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.tipoSeleccionado = '';
    this.estadoCodigo = '';
    this.comprobantes = [];
  }

  private async mostrarToast(message: string, color: string = 'medium') {
    const t = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await t.present();
  }

  volver(): void {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';

    if (['admin', 'administrador', 'superadmin'].includes(rol)) {
      this.router.navigate(['/admin-menu']);
    } else if (rol.includes('gestor')) {
      this.router.navigate(['/menu-gestor']);
    } else {
      this.router.navigate(['/menu-cliente']);
    }
  }

  // =============== DESCARGAR COMPROBANTE =================
  descargarComprobante(m: MovimientoHistorial): void {
    // Transferencia
    if (m.tipo === 'Transferencia' && m.transferenciaId) {
      this.api.downloadComprobanteTransferencia(m.transferenciaId).subscribe({
        next: (blob: any) => {
          const file = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(file);

          const a = document.createElement('a');
          a.href = url;
          a.download = `comprobante-transferencia-${m.transferenciaId}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error descargando comprobante de transferencia:', err);
          this.mostrarToast(
            'No se pudo descargar el comprobante de transferencia.',
            'danger'
          );
        },
      });
      return;
    }

    // Pago de servicio
    if (m.tipo === 'PagoServicio' && m.pagoServicioId) {
      this.api.downloadComprobantePago(m.pagoServicioId).subscribe({
        next: (blob: any) => {
          const file = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(file);

          const a = document.createElement('a');
          a.href = url;
          a.download = `comprobante-pago-${m.pagoServicioId}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error descargando comprobante de pago:', err);
          this.mostrarToast(
            'No se pudo descargar el comprobante de pago de servicio.',
            'danger'
          );
        },
      });
      return;
    }

    // Si no hay IDs
    this.mostrarToast(
      'Este movimiento no tiene comprobante descargable asociado.',
      'medium'
    );
  }
}
