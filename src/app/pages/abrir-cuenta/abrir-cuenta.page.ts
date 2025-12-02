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
  ) { }

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

    //Leer valores del formulario
    const { clientId, type, currency, initialBalance } = this.form.value;

    const typeMap: Record<string, number> = {
      'Ahorros': 1,      // Savings
      'Corriente': 2,    // Checking
      'Plazo Fijo': 4,   // FixedTerm
    };

    const currencyMap: Record<string, number> = {
      'CRC': 1,
      'USD': 2,
    };

    const body = {
      clientId: Number(clientId),
      type: typeMap[type],
      currency: currencyMap[currency],
      initialBalance: Number(initialBalance ?? 0),
    };

    //Validación por si algo viene raro
    if (!body.type || !body.currency) {
      this.loading = false;
      this.errorMessage = 'Tipo de cuenta o moneda inválidos.';
      return;
    }

    // Llamar al API con el body ya mapeado
    this.api.abrirCuenta(body).subscribe({
      next: async () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada correctamente.';

        const toast = await this.toastCtrl.create({
          message: this.successMessage,
          duration: 2500,
          color: 'success',
        });
        await toast.present();
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
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';

    if (['admin', 'administrador', 'adm', '1', 'superadmin'].includes(rol)) {
      this.router.navigate(['/admin-menu']);
    } else if (['gestor', 'manager', '2'].includes(rol)) {
      this.router.navigate(['/menu-gestor']);
    } else {
      this.router.navigate(['/login']); // fallback por seguridad
    }
  }

}
