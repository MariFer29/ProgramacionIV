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
  ) {}

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

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No hay token en localStorage');
      this.loading = false;
      this.toastCtrl
        .create({
          message: 'No se encontró token de sesión.',
          duration: 2000,
          color: 'danger',
        })
        .then((t) => t.present());
      return;
    }

    let emailFromToken: string | null = null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      emailFromToken =
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ] ||
        payload['email'] ||
        null;

      console.log('EMAIL DESDE JWT:', emailFromToken);
    } catch (e) {
      console.error('Error al decodificar el token JWT:', e);
    }

    if (!emailFromToken) {
      console.warn(
        'No se pudo obtener el email del token, cargando todas las cuentas'
      );
      this.api.getCuentas().subscribe({
        next: (res) => {
          console.log('CUENTAS (sin filtro por cliente):', res);
          this.cuentas = res;
          this.loading = false;
        },
        error: async (err) => {
          console.error('ERROR AL CARGAR CUENTAS:', err);
          this.loading = false;
          const t = await this.toastCtrl.create({
            message: 'Error al cargar las cuentas.',
            duration: 2000,
            color: 'danger',
          });
          t.present();
        },
      });
      return;
    }

    this.api.getClientes().subscribe({
      next: (clientes: any[]) => {
        console.log('CLIENTES:', clientes);

        const cliente = clientes.find(
          (c) => c.correo === emailFromToken || c.email === emailFromToken
        );

        if (!cliente) {
          console.warn(
            'No se encontró cliente con ese correo, cargando todas las cuentas'
          );
          this.api.getCuentas().subscribe({
            next: (res) => {
              console.log('CUENTAS (fallback sin filtro):', res);
              this.cuentas = res;
              this.loading = false;
            },
            error: async (err) => {
              console.error('ERROR AL CARGAR CUENTAS (fallback):', err);
              this.loading = false;
              const t = await this.toastCtrl.create({
                message: 'Error al cargar las cuentas.',
                duration: 2000,
                color: 'danger',
              });
              t.present();
            },
          });
          return;
        }

        const clienteId = cliente.id || cliente.clienteId;
        console.log(
          'CLIENTE ENCONTRADO:',
          cliente,
          'clienteId usado:',
          clienteId
        );

        this.api.getCuentas(clienteId).subscribe({
          next: (res) => {
            console.log('CUENTAS FILTRADAS POR CLIENTE:', res);
            this.cuentas = res;
            this.loading = false;
          },
          error: async (err) => {
            console.error('ERROR AL CARGAR CUENTAS FILTRADAS:', err);
            this.loading = false;
            const t = await this.toastCtrl.create({
              message: 'Error al cargar las cuentas.',
              duration: 2000,
              color: 'danger',
            });
            t.present();
          },
        });
      },
      error: async (err) => {
        console.error('ERROR AL OBTENER CLIENTES:', err);
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Error al cargar los datos del cliente.',
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
