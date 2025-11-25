import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
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
  selector: 'app-cuentas',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
})
export class CuentasPage implements OnInit {

  cuentas: Account[] = [];
  isLoading = false;
  errorMessage = '';

  clientIdFilter?: number;

  // NUEVOS FILTROS
  typeFilter = '';
  currencyFilter = '';
  statusFilter = '';

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
  }

  cargarCuentas() {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getCuentas(this.clientIdFilter).subscribe({
      next: (data) => {
        this.cuentas = data;
        this.isLoading = false;
      },
      error: async (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar las cuentas.';
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

  // ABRIR CUENTA
  irAbrirCuenta() {
    this.router.navigate(['/abrir-cuenta']);
  }

  // CONFIRMAR BLOQUEO O CIERRE
  async confirmarAccion(id: string, tipo: 'bloquear' | 'cerrar') {
    const alert = await this.alertCtrl.create({
      header: tipo === 'bloquear' ? 'Bloquear cuenta' : 'Cerrar cuenta',
      message: `¿Seguro que deseas ${tipo} esta cuenta?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: () => {
            if (tipo === 'bloquear') {
              this.bloquearCuenta(id);
            } else {
              this.cerrarCuenta(id);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // BLOQUEAR
  private bloquearCuenta(id: string) {
    this.api.bloquearCuenta(id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: 'Cuenta bloqueada correctamente.',
          duration: 2000,
          color: 'success',
        });
        await t.present();
        this.cargarCuentas();
      },
      error: async (err) => {
        console.error(err);
        const t = await this.toastCtrl.create({
          message: 'Error al bloquear la cuenta.',
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      },
    });
  }

  // CERRAR
  private cerrarCuenta(id: string) {
    this.api.cerrarCuenta(id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: 'Cuenta cerrada correctamente.',
          duration: 2000,
          color: 'success',
        });
        await t.present();
        this.cargarCuentas();
      },
      error: async (err) => {
        console.error(err);
        const t = await this.toastCtrl.create({
          message: 'Error al cerrar la cuenta.',
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      },
    });
  }

  // FILTROS
  get cuentasFiltradas(): Account[] {
    return this.cuentas.filter(c => {
      return (
        (!this.typeFilter || c.type === this.typeFilter) &&
        (!this.currencyFilter || c.currency === this.currencyFilter) &&
        (!this.statusFilter || c.status === this.statusFilter)
      );
    });
  }

}
