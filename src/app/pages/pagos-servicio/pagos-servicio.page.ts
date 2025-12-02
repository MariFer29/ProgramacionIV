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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './pagos-servicio.page.html',
  styleUrls: ['./pagos-servicio.page.scss'],
})

export class PagosServicioPage implements OnInit {
  form!: FormGroup;

  cuentas: Cuenta[] = [];
  proveedores: ProveedorServicio[] = [];
  pagos: PagoServicio[] = [];

  saldoDisponible: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

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
      monto: [0, [Validators.required, Validators.min(1)]],
      moneda: ['CRC', Validators.required],
      fechaProgramada: [null], // opcional
    });

    this.cargarProveedores();
    this.cargarCuentas();
    this.cargarPagos();
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


  cargarProveedores(): void {
    this.api.getProveedoresServicio().subscribe({
      next: (data) => (this.proveedores = data),
      error: async (err) => {
        console.error('Error al cargar proveedores:', err);
        const t = await this.toastCtrl.create({
          message: 'Error al cargar proveedores.',
          duration: 2000,
          color: 'danger',
        });
        t.present();
      },
    });
  }

  cargarCuentas(): void {
    this.loading = true;

    const rolRaw = localStorage.getItem('rol') || '';
    const rol = rolRaw.toLowerCase();
    const token = localStorage.getItem('token') || '';

    const payload = token ? this.decodeToken(token) : null;
    console.log('PAYLOAD TOKEN (PagosServicio):', payload);

    const clienteIdFromToken = payload?.clienteId;
    const clienteId =
      clienteIdFromToken !== undefined && clienteIdFromToken !== null
        ? Number(clienteIdFromToken)
        : NaN;

    this.api.getCuentas().subscribe({
      next: (todas: Cuenta[]) => {

        // Mapear moneda y tipo de cuenta
        const monedaMap: any = { 1: 'CRC', 2: 'USD' };

        const cuentasMapeadas = todas.map(c => ({
          ...c,
          currency: monedaMap[Number(c.currency)] || 'CRC',

        }));
        if (rol === 'cliente') {
          if (!Number.isNaN(clienteId) && clienteId > 0) {
            this.cuentas = cuentasMapeadas.filter(c => c.clientId === clienteId);
          } else {
            console.warn(
              'Rol cliente pero token sin clienteId válido (PagosServicio). No se mostrarán cuentas.'
            );
            this.cuentas = [];
          }
        } else {
          this.cuentas = cuentasMapeadas;
        }

        if (this.cuentas.length === 1) {
          const unica: any = this.cuentas[0];
          this.form.patchValue({ cuentaOrigenId: unica.id });
          this.saldoDisponible =
            typeof unica.balance === 'number' ? unica.balance : null;
        } else {
          this.saldoDisponible = null;
        }

        this.loading = false;
      },
      error: async (err) => {
        console.error('Error al cargar cuentas (PagosServicio):', err);
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

  cargarPagos(): void {
    this.api.getPagosServicio().subscribe({
      next: (data) => (this.pagos = data),
      error: (err) => console.error('Error al cargar pagos de servicio:', err),
    });
  }


  onCuentaOrigenChange(cuentaId: string) {
    const c = this.cuentas.find((x: any) => String(x.id) === String(cuentaId));

    if (c && typeof (c as any).balance === 'number') {
      this.saldoDisponible = (c as any).balance;
    } else {
      this.saldoDisponible = null;
    }
  }


  registrarPago(): void {
    if (this.form.invalid) {
      return;
    }

    const valores = this.form.value;

    const body = {
      proveedorId: valores.proveedorId,
      cuentaOrigenId: valores.cuentaOrigenId,
      numeroContrato: valores.numeroContrato,
      moneda: valores.moneda,
      monto: Number(valores.monto),
      fechaProgramada: valores.fechaProgramada || null,
    };

    this.loading = true;

    this.api.crearPagoServicio(body).subscribe({
      next: async () => {
        this.loading = false;

        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Pago de servicio registrado correctamente.',
          buttons: ['OK'],
        });
        await alert.present();

        this.cargarCuentas();
        this.cargarPagos();

        const cuentaActual = this.form.get('cuentaOrigenId')?.value;
        this.form.reset({
          proveedorId: '',
          cuentaOrigenId: cuentaActual || '',
          numeroContrato: '',
          monto: 0,
          moneda: 'CRC',
          fechaProgramada: null,
        });
      },
      error: async (err) => {
        this.loading = false;
        console.error('Error al registrar pago de servicio:', err);
        const msg =
          err.error?.message ||
          err.error?.mensaje ||
          'Error al registrar el pago de servicio.';
        const t = await this.toastCtrl.create({
          message: msg,
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
