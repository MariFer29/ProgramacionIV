import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-pagos-servicio',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './pagos-servicio.page.html',
  styleUrls: ['./pagos-servicio.page.scss'],
})
export class PagosServicioPage implements OnInit {
  form!: FormGroup;

  proveedores: any[] = [];
  cuentas: any[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      proveedorId: ['', Validators.required],
      cuentaOrigenId: ['', Validators.required],
      numeroContrato: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ],
      ],
      moneda: ['CRC', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      fechaProgramada: [''], // opcional
    });

    this.cargarProveedores();
    this.cargarCuentas();
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

  async enviarPago(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.form.value;

    const body = {
      proveedorId: value.proveedorId,
      cuentaOrigenId: value.cuentaOrigenId,
      numeroContrato: value.numeroContrato,
      moneda: value.moneda,
      monto: Number(value.monto),
      fechaProgramada: value.fechaProgramada ? value.fechaProgramada : null,
    };

    this.api.crearPagoServicio(body).subscribe({
      next: async () => {
        this.loading = false;
        this.successMessage = 'Pago de servicio registrado correctamente.';

        const toast = await this.toastCtrl.create({
          message: this.successMessage,
          duration: 2500,
          color: 'success',
        });
        await toast.present();

        this.form.reset({
          moneda: 'CRC',
          monto: 0,
        });
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.error ||
          'Error al registrar el pago de servicio.';

        const toast = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  volver(): void {
    this.router.navigate(['/cuentas']);
  }
}
