import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './clientes-detalle.page.html',
  styleUrls: ['./clientes-detalle.page.scss']
})
export class ClientesDetallePage implements OnInit {

  clienteForm: FormGroup;
  clienteId!: number;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {
    this.clienteForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      identificacion: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCliente();
  }

  cargarCliente() {
    this.api.getCliente(this.clienteId).subscribe({
      next: (res) => {
        this.clienteForm.patchValue(res);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando cliente';
      }
    });
  }

  actualizarCliente() {
    if (this.clienteForm.invalid) return;

    const data = this.clienteForm.getRawValue();

    this.api.actualizarCliente(this.clienteId, data).subscribe({
      next: (res: any) => {
        this.successMessage = 'Cambios guardados correctamente.';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error(err);

        if (err.status === 200 || err.status === 204) {
          this.successMessage = 'Cambios guardados correctamente.';
          this.errorMessage = '';
          return;
        }

        this.errorMessage = 'Error actualizando cliente';
        this.successMessage = '';
      }
    });
  }

  volver() {
    this.router.navigate(['/clientes']);
  }

}

