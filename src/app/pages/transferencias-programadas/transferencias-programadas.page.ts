import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Cuenta, TransferenciaProgramada } from '../../models/banca.models';



@Component({
  selector: 'app-transferencias-programadas',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './transferencias-programadas.page.html',
  styleUrls: ['./transferencias-programadas.page.scss'],
})
export class TransferenciasProgramadasPage implements OnInit {
  cuentas: Cuenta[] = [];
  cuentaOrigen: string = '';
  cuentaDestino: string = '';
  monto: number = 0;
  fechaEjecucion: string = '';
  detalle: string = '';
  moneda: string = 'CRC';

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    const clienteIdStr = localStorage.getItem('clienteId');
    console.log('clienteId en localStorage (TP):', clienteIdStr);

    let obs$;

    if (clienteIdStr) {
      const clienteId = Number(clienteIdStr);
      if (!isNaN(clienteId) && clienteId > 0) {
        obs$ = this.api.getCuentas(clienteId);
      } else {
        obs$ = this.api.getCuentas();
      }
    } else {
      obs$ = this.api.getCuentas();
    }

    obs$.subscribe({
      next: (res) => {
        console.log('CUENTAS CARGADAS TP:', res);
        this.cuentas = res;
      },
      error: (err) => {
        console.error('ERROR AL CARGAR CUENTAS TP:', err);
        this.showToast('Error al cargar cuentas');
      },
    });
  }

  registrar(): void {
    console.log('CLICK registrar()');

    console.log('VALORES:', {
      cuentaOrigen: this.cuentaOrigen,
      cuentaDestino: this.cuentaDestino,
      monto: this.monto,
      moneda: this.moneda,
      fechaEjecucion: this.fechaEjecucion,
      detalle: this.detalle,
    });

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
      detalle: this.detalle, // el backend lo ignorará si la entidad no tiene esta propiedad
    };

    console.log('BODY A ENVIAR TP:', body);

    this.api.crearTransferenciaProgramada(body).subscribe({
      next: async (resp) => {
        console.log('RESPUESTA API TP:', resp);
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Transferencia programada registrada',
          buttons: ['OK'],
        });
        await alert.present();
        this.resetForm();
      },
      error: (err) => {
        console.error('ERROR API TP:', err);
        this.showToast('Error al registrar transferencia programada');
      },
    });
  }

  private resetForm() {
    this.cuentaOrigen = '';
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
    await toast.present();
  }

  goToMenu() {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';

    if (['admin', 'administrador', 'adm', '1', 'superadmin'].includes(rol)) {
      // Redirigir a menú admin
      this.router.navigate(['/admin-menu']);
    } else {
      // Si no es admin, asumimos cliente
      this.router.navigate(['/menu-cliente']);
    }
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
