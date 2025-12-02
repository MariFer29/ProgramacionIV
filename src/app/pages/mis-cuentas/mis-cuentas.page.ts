import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

export interface Account {
  id: string;
  accountNumber: string;
  type: string;
  currency: string;
  balance: number;
  status: string;
  clientId: number;
  createdAt: string;
}

@Component({
  selector: 'app-mis-cuentas',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './mis-cuentas.page.html',
  styleUrls: ['./mis-cuentas.page.scss'],
})
export class MisCuentasPage implements OnInit {
  cuentas: Account[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMisCuentas();
  }

  // ===============================
  //      UTILIDAD: DECODIFICAR TOKEN
  // ===============================
  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      console.warn('No se pudo decodificar el token en MisCuentas');
      return null;
    }
  }

  cargarMisCuentas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();

    const token = localStorage.getItem('token') || '';
    const payload = token ? this.decodeToken(token) : null;

    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    if (rol === 'cliente' && (Number.isNaN(clienteId) || clienteId <= 0)) {
      this.isLoading = false;
      this.errorMessage =
        'No se pudo identificar el cliente desde el token. Inicia sesión de nuevo.';
      return;
    }

    let obs$;

    if (rol === 'cliente') {
      obs$ = this.api.getCuentas(clienteId);
    } else {
      obs$ = this.api.getCuentas();
    }

    obs$.subscribe({
      next: (data: any[]) => {
        console.log('CUENTAS MIS-CUENTAS:', data);
        this.cuentas = data || [];
        this.isLoading = false;
      },
      error: async (err) => {
        console.error('Error al cargar cuentas:', err);
        this.errorMessage = 'Error al cargar tus cuentas.';
        this.isLoading = false;

        const t = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      },
    });
  }

  volverAlMenuCliente(): void {
    this.router.navigate(['/menu-cliente']);
  }
}
