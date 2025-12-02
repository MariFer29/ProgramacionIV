import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auditoria } from 'src/app/models/banca.models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.page.html',
  styleUrls: ['./auditoria.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AuditoriaPage {
  fechaDesde: string = '';
  fechaHasta: string = '';
  usuarioId?: number | null;
  tipoOperacion: string = '';

  registros: Auditoria[] = [];
  loading = false;

  constructor(
    private api: ApiService,
    private toastController: ToastController,
    private router: Router
  ) { }

  buscar() {
    this.loading = true;

    this.api
      .getAuditoria(
        this.fechaDesde || undefined,
        this.fechaHasta || undefined,
        this.usuarioId ?? null,
        this.tipoOperacion || null
      )
      .subscribe({
        next: (data) => {
          this.registros = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.mostrarToast('Error al cargar auditoría.', 'danger');
        },
      });
  }

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
