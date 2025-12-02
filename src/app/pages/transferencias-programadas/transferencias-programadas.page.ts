import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transferencias-programadas',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './transferencias-programadas.page.html',
  styleUrls: ['./transferencias-programadas.page.scss'],
})
export class TransferenciasProgramadasPage implements OnInit {
  cuentasOrigen: any[] = [];
  cuentasDestino: any[] = [];

  cuentaOrigen: string = '';
  cuentaDestino: string = '';

  saldoDisponible: number | null = null;

  monto: number = 0;
  fechaEjecucion: string = '';
  detalle: string = '';
  moneda: string = 'CRC';

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCuentas();
  }

  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  cargarCuentas(): void {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    const clienteId = payload?.clienteId ? Number(payload.clienteId) : NaN;

    this.api.getCuentas().subscribe({
      next: (todas: any[]) => {
        // Filtrar solo cuentas activas (status = 1)
        const cuentasActivas = todas.filter(c => c.status === 1);

        const cuentasMapeadas = cuentasActivas.map(c => ({
          ...c,
          currency: c.currency === 2 ? 'USD' : 'CRC', 
        }));

        this.cuentasDestino = cuentasMapeadas;

        if (rol === 'cliente' && !isNaN(clienteId) && clienteId > 0) {
          this.cuentasOrigen = cuentasMapeadas.filter(c => c.clientId === clienteId);
        } else {
          this.cuentasOrigen = cuentasMapeadas;
        }

        if (this.cuentasOrigen.length === 1) {
          const unica = this.cuentasOrigen[0];
          this.cuentaOrigen = unica.id;
          this.saldoDisponible = unica.balance;
        } else {
          this.saldoDisponible = null;
        }
      },
      error: (err) => {
        console.error('ERROR CUENTAS TP:', err);
        this.showToast('Error al cargar cuentas');
      },
    });
  }

  onCuentaOrigenChange() {
    const c = this.cuentasOrigen.find((x) => x.id === this.cuentaOrigen);
    this.saldoDisponible = c ? c.balance : null;
  }

  registrar(): void {
    if (
      !this.cuentaOrigen ||
      !this.cuentaDestino ||
      this.monto <= 0 ||
      !this.fechaEjecucion
    ) {
      this.showToast('Completa todos los campos obligatorios');
      return;
    }

    const body = {
      cuentaOrigenId: this.cuentaOrigen,
      cuentaDestinoId: this.cuentaDestino,
      monto: this.monto,
      moneda: this.moneda,
      fechaEjecucion: this.fechaEjecucion,
      detalle: this.detalle,
    };

    this.api.crearTransferenciaProgramada(body).subscribe({
      next: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Transferencia programada registrada',
          buttons: ['OK'],
        });
        alert.present();

        this.resetForm();
      },
      error: (err) => {
        console.error('ERROR API TP:', err);
        this.showToast('Error al registrar transferencia programada');
      },
    });
  }

  private resetForm() {
    this.cuentaDestino = '';
    this.monto = 0;
    this.fechaEjecucion = '';
    this.detalle = '';
    this.moneda = 'CRC';
  }

  private async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  goToMenu() {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';

    if (['admin', 'administrador', 'adm', '1', 'superadmin'].includes(rol)) {
      this.router.navigate(['/admin-menu']);
    } else if (rol.includes('gestor')) {
      this.router.navigate(['/menu-gestor']);
    } else {
      this.router.navigate(['/menu-cliente']);
    }
  }
}
