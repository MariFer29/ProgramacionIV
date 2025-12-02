import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { Cuenta, ExtractoMensual } from 'src/app/models/banca.models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-extractos',
  templateUrl: './extractos.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ExtractosPage implements OnInit {
  cuentas: Cuenta[] = [];
  extracto: ExtractoMensual | null = null;

  cuentaSeleccionadaId: string = '';
  anioSeleccionado: string = '';
  mesSeleccionado: string = ''; // 1-12

  loading = false;

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();

    const hoy = new Date();
    this.anioSeleccionado = hoy.getFullYear().toString();
    this.mesSeleccionado = (hoy.getMonth() + 1).toString().padStart(2, '0');
  }

  // =============== UTILIDAD TOKEN =================
  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      console.warn('No se pudo decodificar el token en Extractos');
      return null;
    }
  }

  // =============== CARGAR CUENTAS =================
  cargarCuentas(): void {
    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    console.log('PAYLOAD TOKEN (Extractos):', payload);

    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    let obs$;

    if (rol === 'cliente') {
      if (Number.isNaN(clienteId) || clienteId <= 0) {
        console.warn(
          'Rol cliente pero sin clienteId válido en el token. No se cargan cuentas (Extractos).'
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
        console.log('CUENTAS EXTRACTOS:', data);
        this.cuentas = data;

        // Si solo hay una cuenta, la preseleccionamos
        if (this.cuentas.length === 1) {
          this.cuentaSeleccionadaId = this.cuentas[0].id as any;
        }
      },
      error: (err) => {
        console.error('Error al cargar cuentas en Extractos:', err);
        this.mostrarToast('Error al cargar cuentas', 'danger');
      },
    });
  }

  // =============== BUSCAR EXTRACTO =================
  buscar(): void {
    if (!this.cuentaSeleccionadaId) {
      this.mostrarToast('Seleccione una cuenta.');
      return;
    }

    const anio = Number(this.anioSeleccionado);
    const mes = Number(this.mesSeleccionado);

    if (!anio || anio < 2000) {
      this.mostrarToast('Ingrese un año válido.');
      return;
    }

    if (!mes || mes < 1 || mes > 12) {
      this.mostrarToast('Seleccione un mes válido.');
      return;
    }

    this.loading = true;
    this.extracto = null;

    console.log('BUSCAR EXTRACTO → cuentaId:', this.cuentaSeleccionadaId);
    console.log('BUSCAR EXTRACTO → anio/mes:', anio, mes);

    this.api
      .getExtractoMensual(this.cuentaSeleccionadaId, anio, mes)
      .subscribe({
        next: (data) => {
          console.log('RESPUESTA EXTRACTO:', data);
          this.extracto = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener extracto:', err);
          this.loading = false;
          this.mostrarToast(
            err.error?.message ||
              err.error?.mensaje ||
              'Error al obtener el extracto mensual.',
            'danger'
          );
        },
      });
  }

  limpiar(): void {
    this.extracto = null;
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

  // =============== DESCARGAR EXTRACTO (PDF) =================
  descargarExtractoPdf(): void {
    if (!this.extracto) {
      this.mostrarToast('Primero genere el extracto.', 'medium');
      return;
    }

    const { cuentaId, anio, mes, numeroCuenta } = this.extracto;

    this.api.downloadExtractoMensualPdf(cuentaId, anio, mes).subscribe({
      next: (blob: any) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = url;
        a.download = `extracto-${numeroCuenta}-${anio}-${mes
          .toString()
          .padStart(2, '0')}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando extracto PDF:', err);
        this.mostrarToast('No se pudo descargar el extracto en PDF.', 'danger');
      },
    });
  }
}
