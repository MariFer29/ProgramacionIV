import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { Cuenta } from 'src/app/models/banca.models';

@Component({
  selector: 'app-transferencias',
  templateUrl: './transferencias.page.html',
  styleUrls: ['./transferencias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class TransferenciasPage implements OnInit {
  transferForm!: FormGroup;

  cuentasOrigen: Cuenta[] = [];
  cuentasDestino: Cuenta[] = [];

  saldoDisponible: number | null = null;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.transferForm = this.fb.group({
      cuentaOrigenId: ['', Validators.required],
      cuentaDestinoId: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      moneda: ['CRC', Validators.required],
      idempotencyKey: [''],
    });

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

  cargarCuentas() {
    this.loading = true;

    const rol = localStorage.getItem('rol')?.toLowerCase() || '';
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    this.api.getCuentas().subscribe({
      next: async (todasLasCuentas: any[]) => {

        const monedaMap: any = { 1: 'CRC', 2: 'USD' };

        const cuentasMapeadas = todasLasCuentas.map(c => ({
          ...c,
          currency: monedaMap[c.currency] || 'CRC',
        }));

        this.cuentasDestino = cuentasMapeadas;

        if (rol === 'cliente' && !Number.isNaN(clienteId) && clienteId > 0) {
          this.cuentasOrigen = cuentasMapeadas.filter(c => c.clientId === clienteId);
        } else {
          this.cuentasOrigen = cuentasMapeadas;
        }

        if (this.cuentasOrigen.length === 1) {
          const unica = this.cuentasOrigen[0];
          this.transferForm.patchValue({ cuentaOrigenId: unica.id });
          this.saldoDisponible =
            typeof unica.balance === 'number' ? unica.balance : null;
        } else {
          this.saldoDisponible = null;
        }

        this.loading = false;
      },
      error: async (err) => {
        console.error('Error al cargar cuentas:', err);
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Error al cargar cuentas del cliente.',
          duration: 2000,
          color: 'danger',
        });
        t.present();
      },
    });
  }


  onCuentaOrigenChange(cuentaId: string) {
    const c = this.cuentasOrigen.find((x: any) => x.id === cuentaId);

    if (c && typeof c.balance === 'number') {
      this.saldoDisponible = c.balance;
    } else {
      this.saldoDisponible = null;
    }
  }

  async enviarTransferencia() {
    if (this.transferForm.invalid) return;

    this.loading = true;

    const body = { ...this.transferForm.value };

    if (!body.idempotencyKey) {
      body.idempotencyKey = 'tx-' + Date.now();
    }

    const montoNum = Number(this.transferForm.value.monto) || 0;
    const cuentaOrigenId = this.transferForm.value.cuentaOrigenId as string;

    this.api.crearTransferencia(body).subscribe({
      next: async () => {
        this.loading = false;

        const actualizarSaldoEnLista = (lista: Cuenta[]) => {
          const cuenta = lista.find((c) => c.id === cuentaOrigenId);
          if (cuenta && typeof cuenta.balance === 'number') {
            const saldoActual = Number(cuenta.balance) || 0;
            const nuevoSaldo = saldoActual - montoNum; 
            cuenta.balance = nuevoSaldo;

            if (lista === this.cuentasOrigen) {
              this.saldoDisponible = nuevoSaldo;
            }
          }
        };

        actualizarSaldoEnLista(this.cuentasOrigen);
        actualizarSaldoEnLista(this.cuentasDestino);

        const t = await this.toastCtrl.create({
          message: 'Transferencia registrada correctamente.',
          duration: 2000,
          color: 'success',
        });
        t.present();

        this.transferForm.patchValue({
          monto: 0,
          cuentaDestinoId: '',
          idempotencyKey: '',
        });
      },
      error: async (err) => {
        this.loading = false;
        console.error(err);
        const msg =
          err.error?.message || 'Error al registrar la transferencia.';
        const t = await this.toastCtrl.create({
          message: msg,
          duration: 2500,
          color: 'danger',
        });
        t.present();
      },
    });
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
