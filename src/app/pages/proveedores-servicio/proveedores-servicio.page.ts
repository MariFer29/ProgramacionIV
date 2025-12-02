import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ProveedorServicio } from 'src/app/models/banca.models';

@Component({
  selector: 'app-proveedores-servicio',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './proveedores-servicio.page.html',
  styleUrls: ['./proveedores-servicio.page.scss'],
})
export class ProveedoresServicioPage implements OnInit {
  form!: FormGroup;
  proveedores: ProveedorServicio[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rolLocal = localStorage.getItem('rol') || '';
    const rol = rolLocal.toLowerCase();

    if (!['administrador', 'admin', 'superadmin'].includes(rol)) {
      this.isAdmin = false;
      this.errorMessage = 'No tiene permisos para acceder a esta sección.';
      return;
    }

    this.isAdmin = true;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      moneda: ['CRC', Validators.required],
    });

    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.api.getProveedoresServicio().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.loading = false;
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error al cargar proveedores de servicio.';
        const t = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        t.present();
      },
    });
  }

  async guardarProveedor(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.form.value;

    const body = {
      nombre: value.nombre,
      descripcion: value.descripcion,
      moneda: value.moneda,
    };

    this.api.crearProveedorServicio(body).subscribe({
      next: async () => {
        this.loading = false;
        this.successMessage = 'Proveedor creado correctamente.';
        const t = await this.toastCtrl.create({
          message: this.successMessage,
          duration: 2500,
          color: 'success',
        });
        t.present();
        this.form.reset({
          moneda: 'CRC',
        });
        this.cargarProveedores();
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.error ||
          'Error al crear el proveedor.';
        const t = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        t.present();
      },
    });
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
