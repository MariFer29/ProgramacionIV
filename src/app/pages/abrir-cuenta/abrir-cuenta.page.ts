import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-abrir-cuenta',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './abrir-cuenta.page.html',
  styleUrls: ['./abrir-cuenta.page.scss'],
})
export class AbrirCuentaPage implements OnInit {

  form!: FormGroup;
  clientes: any[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  tiposCuenta = ['Ahorros', 'Corriente', 'Plazo Fijo'];
  monedas = ['CRC', 'USD'];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      type: ['', Validators.required],
      currency: ['', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
    });

    this.cargarClientes();
  }

  cargarClientes(): void {
    this.api.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar los clientes.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.abrirCuenta(this.form.value).subscribe({
      next: async () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada correctamente.';

        const toast = await this.toastCtrl.create({
          message: this.successMessage,
          duration: 2500,
          color: 'success',
        });
        await toast.present();

        this.router.navigate(['/cuentas']);
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.error ||
          'Error al abrir la cuenta.';

        const toast = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        await toast.present();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/cuentas']);
  }
}
