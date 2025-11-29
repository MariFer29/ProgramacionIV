import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

export interface Beneficiario {
  id: number;
  nombre: string;
  identificacion: string;
  relacion: string;
  cuentaId: string;
}

@Component({
  selector: 'app-beneficiarios',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
})
export class BeneficiariosPage implements OnInit {

  form!: FormGroup;

  beneficiarios: Beneficiario[] = [];
  cuentas: any[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      identificacion: ['', Validators.required],
      relacion: ['', Validators.required],
      cuentaId: ['', Validators.required],
    });

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Beneficiarios
    this.api.getBeneficiarios().subscribe({
      next: (data) => {
        this.beneficiarios = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar beneficiarios.';
        this.loading = false;
      }
    });

    // Cuentas para el select
    this.api.getCuentas().subscribe({
      next: (cuentas: any[]) => {
        this.cuentas = cuentas;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  seleccionarParaEditar(b: Beneficiario): void {
    this.editingId = b.id;
    this.form.patchValue({
      nombre: b.nombre,
      identificacion: b.identificacion,
      relacion: b.relacion,
      cuentaId: b.cuentaId,
    });
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelarEdicion(): void {
    this.editingId = null;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const body = this.form.value;

    const obs = this.editingId == null
      ? this.api.crearBeneficiario(body)
      : this.api.actualizarBeneficiario(this.editingId, body);

    obs.subscribe({
      next: async () => {
        this.loading = false;
        this.successMessage = this.editingId == null
          ? 'Beneficiario registrado correctamente.'
          : 'Beneficiario actualizado correctamente.';

        const t = await this.toastCtrl.create({
          message: this.successMessage,
          duration: 2500,
          color: 'success',
        });
        await t.present();

        this.form.reset();
        this.editingId = null;
        this.cargarDatos();
      },
      error: async (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.error ||
          'Error al guardar beneficiario.';

        const t = await this.toastCtrl.create({
          message: this.errorMessage,
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      }
    });
  }

  async confirmarEliminar(b: Beneficiario): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar beneficiario',
      message: `¿Seguro que deseas eliminar a "${b.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(b.id),
        }
      ]
    });

    await alert.present();
  }

  eliminar(id: number): void {
    this.api.eliminarBeneficiario(id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: 'Beneficiario eliminado.',
          duration: 2000,
          color: 'medium',
        });
        await t.present();
        this.cargarDatos();
      },
      error: async (err) => {
        console.error(err);
        const t = await this.toastCtrl.create({
          message: 'Error al eliminar beneficiario.',
          duration: 2500,
          color: 'danger',
        });
        await t.present();
      }
    });
  }

  volver(): void {
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
