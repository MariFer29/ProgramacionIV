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

  cargarCuentas(): void {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';
    const clienteIdStr = localStorage.getItem('clienteId');

    let obs$;

    if (rol === 'cliente') {
      if (!clienteIdStr) {
        console.warn(
          'Cliente sin clienteId en localStorage, no se cargan cuentas.'
        );
        this.cuentas = [];
        return;
      }

      const clienteId = Number(clienteIdStr);
      if (isNaN(clienteId) || clienteId <= 0) {
        console.warn('clienteId inválido, no se cargan cuentas.');
        this.cuentas = [];
        return;
      }

      obs$ = this.api.getCuentas(clienteId);
    } else {
      obs$ = this.api.getCuentas();
    }

    obs$.subscribe({
      next: (data) => {
        this.cuentas = data;
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al cargar cuentas', 'danger');
      },
    });
  }

  buscar(): void {
    if (!this.cuentaSeleccionadaId) {
      this.mostrarToast('Seleccione una cuenta.');
      return;
    }

    if (!this.fechaDesde || !this.fechaHasta) {
      this.mostrarToast('Debe seleccionar el rango de fechas.');
      return;
    }

    const filtros: HistorialFiltro = {
      desde: this.fechaDesde,
      hasta: this.fechaHasta,
      tipo: this.tipoSeleccionado ? Number(this.tipoSeleccionado) : undefined,
      estado: this.estadoCodigo ? Number(this.estadoCodigo) : undefined,
    };

    this.loading = true;
    this.movimientos = [];

    const clienteIdStr = localStorage.getItem('clienteId');
    const clienteId = clienteIdStr ? Number(clienteIdStr) : 0;

    this.api
      .getHistorialPorCliente(clienteId, {
        ...filtros,
        cuentaId: this.cuentaSeleccionadaId || null,
      })
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.movimientos = data;
        },
        error: (err) => {
          console.error(err);
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
}
