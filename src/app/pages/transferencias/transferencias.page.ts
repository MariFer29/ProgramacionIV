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

@Component({
  selector: 'app-transferencias',
  templateUrl: './transferencias.page.html',
  styleUrls: ['./transferencias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class TransferenciasPage implements OnInit {
  transferForm!: FormGroup;
  cuentas: any[] = [];
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

  cargarCuentas() {
    this.loading = true;
    this.api.getCuentas().subscribe({
      next: (res) => {
        this.cuentas = res;
        this.loading = false;
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Error al cargar las cuentas.',
          duration: 2000,
          color: 'danger',
        });
        t.present();
      },
    });
  }

  async enviarTransferencia() {
    if (this.transferForm.invalid) return;

    this.loading = true;

    const body = this.transferForm.value;

    // si no viene idempotencyKey, generamos una simple
    if (!body.idempotencyKey) {
      body.idempotencyKey = 'tx-' + Date.now();
    }

    this.api.crearTransferencia(body).subscribe({
      next: async (res) => {
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Transferencia registrada correctamente.',
          duration: 2000,
          color: 'success',
        });
        t.present();
        // opcional: resetear solo el monto
        this.transferForm.patchValue({ monto: 0 });
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
      // Redirigir a menú admin
      this.router.navigate(['/admin-menu']);
    } else {
      // Si no es admin, asumimos cliente
      this.router.navigate(['/menu-cliente']);
    }
  }

}
