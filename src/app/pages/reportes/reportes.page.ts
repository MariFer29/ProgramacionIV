import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import {
  ReporteTotales,
  ClienteTop,
  VolumenDiario,
} from 'src/app/models/banca.models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ReportesPage implements OnInit {
  segment: 'totales' | 'top' | 'volumen' = 'totales';

  // filtros compartidos
  fechaDesde: string = '';
  fechaHasta: string = '';
  topCantidad: number = 5;

  // datos
  reporteTotales: ReporteTotales | null = null;
  topClientes: ClienteTop[] = [];
  volumenDiario: VolumenDiario[] = [];

  loading = false;

  constructor(
    private api: ApiService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit(): void { }

  cambiarSegment(valor: any) {
    if (!valor) {
      return;
    }
    this.segment = valor as 'totales' | 'top' | 'volumen';
  }

  private validarRangoFechas(): boolean {
    if (!this.fechaDesde || !this.fechaHasta) {
      this.mostrarToast('Debe seleccionar fecha desde y hasta.', 'warning');
      return false;
    }

    if (this.fechaDesde > this.fechaHasta) {
      this.mostrarToast(
        'La fecha "desde" no puede ser mayor que la fecha "hasta".',
        'danger'
      );
      return false;
    }

    return true;
  }

  // ==============
  // Cargar datos
  // ==============

  cargarTotales() {
    if (!this.validarRangoFechas()) return;

    this.loading = true;
    this.api.getReporteTotales(this.fechaDesde, this.fechaHasta).subscribe({
      next: (data) => {
        this.reporteTotales = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.mostrarToast('Error cargando reporte de totales.', 'danger');
      },
    });
  }

  cargarTopClientes() {
    if (!this.validarRangoFechas()) return;

    this.loading = true;
    this.api
      .getTopClientes(this.fechaDesde, this.fechaHasta, this.topCantidad)
      .subscribe({
        next: (data) => {
          this.topClientes = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.mostrarToast('Error cargando top de clientes.', 'danger');
        },
      });
  }

  cargarVolumenDiario() {
    if (!this.validarRangoFechas()) return;

    this.loading = true;
    this.api.getVolumenDiario(this.fechaDesde, this.fechaHasta).subscribe({
      next: (data) => {
        this.volumenDiario = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.mostrarToast('Error cargando volumen diario.', 'danger');
      },
    });
  }

  // ======================
  // Exportar a CSV / "Excel"
  // ======================

  exportarCsv(tipo: 'totales' | 'top' | 'volumen') {
    let csv = '';
    let fileName = '';

    if (tipo === 'totales' && this.reporteTotales) {
      fileName = 'reporte_totales.csv';
      csv += 'Desde,Hasta,TotalOperaciones\n';
      csv += `${this.reporteTotales.desde},${this.reporteTotales.hasta},${this.reporteTotales.totalOperaciones}\n`;
    } else if (tipo === 'top' && this.topClientes.length) {
      fileName = 'top_clientes.csv';
      csv += 'ClienteId,Nombre,MontoTotal\n';
      for (const c of this.topClientes) {
        csv += `${c.clientId},"${c.nombreCliente}",${c.montoTotal}\n`;
      }
    } else if (tipo === 'volumen' && this.volumenDiario.length) {
      fileName = 'volumen_diario.csv';
      csv += 'Dia,MontoTotal\n';
      for (const v of this.volumenDiario) {
        csv += `${v.dia},${v.montoTotal}\n`;
      }
    } else {
      this.mostrarToast('No hay datos para exportar.', 'medium');
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // ======================
  // Utils
  // ======================

  async mostrarToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
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
