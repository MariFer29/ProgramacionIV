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
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HistorialPage implements OnInit {
  cuentas: Cuenta[] = [];
  movimientos: MovimientoHistorial[] = [];

  cuentaSeleccionadaId: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  tipoSeleccionado: string = ''; 
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
      console.warn('No se pudo decodificar el token en Historial');
      return null;
    }
  }

  private normalizarFecha(
    valor: string | null | undefined
  ): string | undefined {
    if (!valor) return undefined;

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

    const date = new Date(valor);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    console.warn('Fecha en formato no reconocido:', valor);
    return undefined;
  }

  // =============== CARGAR CUENTAS =================
  cargarCuentas(): void {
    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    console.log('PAYLOAD TOKEN (Historial):', payload);

    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    let obs$;

    if (rol === 'cliente') {
      if (Number.isNaN(clienteId) || clienteId <= 0) {
        console.warn(
          'Rol cliente pero sin clienteId válido en el token. No se cargan cuentas.'
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
        console.log('CUENTAS HISTORIAL:', data);
        this.cuentas = data;

        // Si solo hay una cuenta, la preseleccionamos
        if (this.cuentas.length === 1) {
          this.cuentaSeleccionadaId = this.cuentas[0].id as any;
        }
      },
      error: (err) => {
        console.error('Error al cargar cuentas en historial:', err);
        this.mostrarToast('Error al cargar cuentas', 'danger');
      },
    });
  }

  // =============== BUSCAR HISTORIAL =================
  buscar(): void {
    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();

    // Solo obligamos a elegir cuenta cuando NO es cliente (admin/gestor)
    if (rol !== 'cliente' && !this.cuentaSeleccionadaId) {
      this.mostrarToast('Seleccione una cuenta.');
      return;
    }

    const desdeNormalizado = this.normalizarFecha(this.fechaDesde);
    const hastaNormalizado = this.normalizarFecha(this.fechaHasta);

    const filtrosBase: HistorialFiltro = {
      desde: desdeNormalizado,
      hasta: hastaNormalizado,
      estado: this.estadoCodigo ? Number(this.estadoCodigo) : undefined,
    };

    this.loading = true;
    this.movimientos = [];

    if (rol === 'cliente') {
      // ===== CLIENTE → historial por cliente, cuenta opcional =====
      const token = localStorage.getItem('token') || '';
      const payload = token ? this.decodeToken(token) : null;
      const clienteIdFromToken = payload?.clienteId;
      const clienteId =
        clienteIdFromToken !== undefined && clienteIdFromToken !== null
          ? Number(clienteIdFromToken)
          : NaN;

      if (Number.isNaN(clienteId) || clienteId <= 0) {
        this.loading = false;
        this.mostrarToast(
          'No se pudo identificar el cliente desde el token.',
          'danger'
        );
        return;
      }

      console.log('BUSCAR HISTORIAL (CLIENTE) → clienteId:', clienteId);
      console.log(
        'BUSCAR HISTORIAL (CLIENTE) → filtros (sin tipo):',
        filtrosBase
      );
      console.log(
        'BUSCAR HISTORIAL (CLIENTE) → cuentaId:',
        this.cuentaSeleccionadaId || null
      );

      this.api
        .getHistorialPorCliente(clienteId, {
          ...filtrosBase,
          cuentaId: this.cuentaSeleccionadaId || null,
        })
        .subscribe({
          next: (data) => {
            this.procesarRespuestaHistorial(data);
          },
          error: (err) => {
            console.error('Error al obtener historial (cliente):', err);
            this.loading = false;
            this.mostrarToast(
              err.error?.message ||
                err.error?.mensaje ||
                'Error al obtener el historial.',
              'danger'
            );
          },
        });
    } else {
      // ===== ADMIN / GESTOR → historial por CUENTA OBLIGATORIA =====
      console.log(
        'BUSCAR HISTORIAL (CUENTA) → cuentaId:',
        this.cuentaSeleccionadaId
      );
      console.log(
        'BUSCAR HISTORIAL (CUENTA) → filtros (sin tipo):',
        filtrosBase
      );

      this.api
        .getHistorialPorCuenta(this.cuentaSeleccionadaId, filtrosBase)
        .subscribe({
          next: (data) => {
            this.procesarRespuestaHistorial(data);
          },
          error: (err) => {
            console.error('Error al obtener historial (cuenta):', err);
            this.loading = false;
            this.mostrarToast(
              err.error?.message ||
                err.error?.mensaje ||
                'Error al obtener el historial.',
              'danger'
            );
          },
        });
    }
  }

  // Procesa la respuesta y aplica el filtro por tipoSeleccionado
  private procesarRespuestaHistorial(data: any): void {
    this.loading = false;
    const rawData: any[] = data || [];
    console.log('RESPUESTA HISTORIAL (RAW):', rawData);

    const tiposUnicos = Array.from(
      new Set(rawData.map((m) => (m.tipo || '').toString()))
    );
    console.log('TIPOS EN RESPUESTA HISTORIAL:', tiposUnicos);

    let result = rawData;

    if (this.tipoSeleccionado === '1') {
      // Solo transferencias
      result = result.filter((m) => m.tipo === 'Transferencia');
    } else if (this.tipoSeleccionado === '2') {
      // Solo pagos de servicio
      result = result.filter((m) => m.tipo === 'PagoServicio');
    }

    console.log('RESPUESTA HISTORIAL (filtrada por tipo):', result);
    this.movimientos = result;
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.tipoSeleccionado = '';
    this.estadoCodigo = '';
    this.movimientos = [];
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
