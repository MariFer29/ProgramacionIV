import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

import {
  Cuenta,
  PagoServicio,
  ProveedorServicio,
} from 'src/app/models/banca.models';

@Component({
  selector: 'app-pagos-servicio',
  templateUrl: './pagos-servicio.page.html',
  styleUrls: ['./pagos-servicio.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
})
export class PagosServicioPage implements OnInit {

  form!: FormGroup;


  cuentas: Cuenta[] = [];
  proveedores: ProveedorServicio[] = [];
  pagos: PagoServicio[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      cuentaOrigenId: ['', Validators.required],
      proveedorId: ['', Validators.required],
      numeroContrato: ['', [Validators.required, Validators.minLength(8)]],
      moneda: ['CRC', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      fechaProgramada: [null],
    });

    this.cargarProveedores();
    this.cargarCuentas();
    this.cargarPagos();
  }

  cargarProveedores(): void {
    this.api.getProveedoresServicio().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar proveedores de servicio.';
      },
    });
  }

  cargarCuentas(): void {
    this.api.getCuentas().subscribe({
      next: (data) => {
        this.cuentas = data;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  cargarPagos(): void {
    this.api.getPagosServicio().subscribe({
      next: (data) => {
        this.pagos = data;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  enviarPago(): void {
    this.registrarPago();
  }

  registrarPago(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarToast('Completa todos los campos obligatorios');
      return;
    }

    const value = this.form.value;

    const body = {
      proveedorId: value.proveedorId,
      cuentaOrigenId: value.cuentaOrigenId,
      numeroContrato: value.numeroContrato,
      moneda: value.moneda,
      monto: value.monto,
      fechaProgramada: value.fechaProgramada || null,
    };

    this.loading = true;

    this.api.crearPagoServicio(body).subscribe({
      next: async (resp) => {
        this.loading = false;
        await this.mostrarAlert(
          'Éxito',
          'Pago de servicio registrado correctamente.'
        );
        this.resetForm();
        this.cargarPagos();
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        const msg =
          err.error?.message ||
          err.error?.mensaje ||
          'Error al registrar el pago de servicio.';
        await this.mostrarToast(msg, 'danger');
      },
    });
  }

  private resetForm() {
    this.form.reset({
      cuentaOrigenId: '',
      proveedorId: '',
      numeroContrato: '',
      moneda: 'CRC',
      monto: 0,
      fechaProgramada: null,
    });
  }

  private async mostrarToast(message: string, color: string = 'medium') {
    const t = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    t.present();
  }

  private async mostrarAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
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
