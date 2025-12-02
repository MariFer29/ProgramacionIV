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
  ) { }

  ngOnInit(): void {
    this.cargarMisCuentas();
  }

  cargarMisCuentas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const clienteIdStr = localStorage.getItem('clienteId');
    const clienteId = clienteIdStr ? Number(clienteIdStr) : null;

    if (!clienteId) {
      this.isLoading = false;
      this.errorMessage = 'No se encontró el cliente actual. Inicia sesión de nuevo.';
      return;
    }

    this.api.getCuentas(clienteId).subscribe({
      next: (data: any[]) => {

        // 🔹 Mapear moneda y tipo de cuenta sin tocar accountNumber
        const monedaMap: any = { 1: 'CRC', 2: 'USD' };
        const tipoMap: any = { 1: 'Ahorros', 2: 'Corriente', 4: 'Plazo Fijo' };
                const statusMap: any = {
          1: 'Activa',
          2: 'Bloqueada',
          3: 'Cerrada'
        };


        this.cuentas = data.map(c => ({
          ...c,
          currency: monedaMap[c.currency] || 'CRC',
          type: tipoMap[c.type] || 'Desconocido',
          status: statusMap[c.status] || 'Desconocido'
        }));

        this.isLoading = false;
      },
      error: async (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar tus cuentas.';
        this.isLoading = false;

        const t = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      }
    });
  }


  volverAlMenuCliente(): void {
    this.router.navigate(['/menu-cliente']);
  }
}
