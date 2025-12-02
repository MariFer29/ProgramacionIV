import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-beneficiarios',
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule],
})
export class BeneficiariosPage implements OnInit {
  form!: FormGroup;
  beneficiarios: any[] = [];
  beneficiariosFiltrados: any[] = [];
  loading = false;
  editingId: string | null = null;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alias: ['', Validators.required],
      bank: ['', Validators.required],
      // 1 = CRC, 2 = USD
      currency: ['1', Validators.required],
      accountNumber: ['', [Validators.required, Validators.minLength(8)]],
      country: ['Costa Rica', Validators.required],
    });

    this.verificarClienteYcargar();
  }

  // ===============================
  // FILTRO EN TIEMPO REAL
  // ===============================
  filtrarBeneficiarios(): void {
    const term = this.searchTerm.toLowerCase();

    this.beneficiariosFiltrados = this.beneficiarios.filter(
      (b) =>
        b.alias.toLowerCase().includes(term) ||
        b.bank.toLowerCase().includes(term) ||
        b.country.toLowerCase().includes(term)
    );
  }

  // ===============================
  //      TOKEN Y CLIENTE ID
  // ===============================
  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      console.warn('No se pudo decodificar el token en Beneficiarios');
      return null;
    }
  }

  private getClienteId(): number | null {
    const token = localStorage.getItem('token') || '';
    const payload = token ? this.decodeToken(token) : null;
    const clienteIdFromToken = payload?.clienteId;

    if (clienteIdFromToken === undefined || clienteIdFromToken === null) {
      return null;
    }

    const clienteId = Number(clienteIdFromToken);
    return Number.isNaN(clienteId) || clienteId <= 0 ? null : clienteId;
  }

  private verificarClienteYcargar(): void {
    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();

    if (rol === 'cliente') {
      const clienteId = this.getClienteId();

      if (!clienteId) {
        this.successMessage = '';
        this.errorMessage =
          'No se encontró el cliente actual. Inicia sesión de nuevo.';
        return;
      }

      this.errorMessage = '';
      this.cargarBeneficiarios(clienteId);
    } else {
      this.successMessage = '';
      this.errorMessage = '';
      this.cargarBeneficiarios();
    }
  }

  // ===============================
  //      CARGAR BENEFICIARIOS
  // ===============================
  private cargarBeneficiarios(clienteId?: number): void {
    this.loading = true;
    this.beneficiarios = [];

    this.api.getBeneficiarios(clienteId).subscribe({
      next: (data: any) => {
        this.loading = false;
        const body = data && data.body ? data.body : data;
        this.beneficiarios = body || [];
        this.beneficiariosFiltrados = [...this.beneficiarios];
      },
      error: (err) => {
        console.error('Error al cargar beneficiarios:', err);
        this.loading = false;
        this.successMessage = '';
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.message ||
          'Error al cargar beneficiarios.';
      },
    });
  }

  // ===============================
  //      GUARDAR (CREAR / EDITAR)
  // ===============================
  guardar(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Complete todos los campos obligatorios.';
      this.successMessage = '';
      return;
    }

    // 1. Obtener el clienteId desde el token
    const clienteId = this.getClienteId();
    if (!clienteId) {
      this.loading = false;
      this.errorMessage =
        'No se encontró el cliente actual. Inicia sesión de nuevo.';
      this.successMessage = '';
      return;
    }

    const valores = this.form.value;


    const body: any = {
      clientId: clienteId, 
      alias: valores.alias,
      bank: valores.bank,
      currency: Number(valores.currency), 
      accountNumber: valores.accountNumber,
      country: valores.country,
    };

    if (this.editingId) {
      body.id = this.editingId; 
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const peticion$ = this.editingId
      ? this.api.actualizarBeneficiario(body)
      : this.api.crearBeneficiario(body);

    peticion$.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.editingId
          ? 'Beneficiario actualizado correctamente.'
          : 'Beneficiario creado correctamente.';
        this.errorMessage = '';
        this.cancelarEdicion(false); 

        // Recargar lista
        const id = this.getClienteId();
        if (id) {
          this.cargarBeneficiarios(id);
        }
      },
      error: (err) => {
        console.error('Error al guardar beneficiario:', err);
        this.loading = false;
        this.successMessage = '';
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.message ||
          'Error al crear el beneficiario.';
      },
    });
  }

  // ===============================
  //      SELECCIONAR PARA EDITAR
  // ===============================
  seleccionarParaEditar(b: any): void {
    this.editingId = b.id;
    const currencyValue = b.currency === 2 || b.currency === '2' ? '2' : '1';

    this.form.patchValue({
      alias: b.alias,
      bank: b.bank,
      currency: currencyValue,
      accountNumber: b.accountNumber,
      country: b.country,
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelarEdicion(resetMessages: boolean = true): void {
    this.editingId = null;
    this.form.reset({
      alias: '',
      bank: '',
      currency: '1',
      accountNumber: '',
      country: 'Costa Rica',
    });

    if (resetMessages) {
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  // ===============================
  //      ELIMINAR
  // ===============================
  async confirmarEliminar(b: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Desea eliminar al beneficiario "${b.alias}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => this.eliminar(b.id) },
      ],
    });

    await alert.present();
  }

  private eliminar(id: string): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.eliminarBeneficiario(id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Beneficiario eliminado correctamente.';
        const rolRaw = localStorage.getItem('rol') || '';
        const rol = rolRaw.toLowerCase();

        if (rol === 'cliente') {
          const clienteId = this.getClienteId();
          if (clienteId) {
            this.cargarBeneficiarios(clienteId);
          }
        } else {
          this.cargarBeneficiarios(); // admin/gestor → recarga todos
        }
      },
      error: (err) => {
        console.error('Error al eliminar beneficiario:', err);
        this.loading = false;
        this.successMessage = '';
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.message ||
          'Error al eliminar el beneficiario.';
      },
    });
  }

  // ===============================
  //      VOLVER AL MENÚ
  // ===============================
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
