import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { 
  IonInput, IonItem, IonLabel, IonButton, 
  IonSelect, IonSelectOption, IonContent, 
  IonHeader, IonToolbar, IonTitle 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption
  ],
  templateUrl: './registrar-usuario.page.html',
  styleUrls: ['./registrar-usuario.page.scss']
})
export class RegistrarUsuarioPage implements OnInit {

  registerForm: FormGroup;
  roles = ['Administrador', 'Gestor', 'Cliente'];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      nombreCompleto: ['', Validators.required],
      telefono: ['', Validators.required],
      identificacion: [''],   // validator dinámico
      rol: ['Cliente', Validators.required]
    });
  }

  ngOnInit() {
    // activar / desactivar validación de identificación según rol
    this.registerForm.get('rol')!.valueChanges.subscribe(rol => {
      const idControl = this.registerForm.get('identificacion');

      if (rol === 'Cliente') {
        idControl?.setValidators([Validators.required]);
      } else {
        idControl?.clearValidators();
        idControl?.setValue(''); // limpiar valor al cambiar de rol
      }

      idControl?.updateValueAndValidity();
    });
  }

  passwordValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const validLength = value.length >= 8;

    return hasUpper && hasNumber && hasSymbol && validLength ? null : { invalidPassword: true };
  }

  public goToClientes() {
    this.router.navigate(['/clientes']);
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = "Debe completar todos los campos requeridos.";
      return;
    }

    const formData = this.registerForm.value;

    // Validación manual extra
    if (formData.rol === 'Cliente' && !formData.identificacion.trim()) {
      this.errorMessage = "La identificación es obligatoria para clientes.";
      return;
    }

    // Si NO es cliente, no enviar identificación al backend
    if (formData.rol !== 'Cliente') {
      delete formData.identificacion;
    }

    this.api.registrarUsuario(formData).subscribe({
      next: (res: any) => {
        this.successMessage = res?.mensaje || "Usuario registrado correctamente.";
        this.errorMessage = "";

        if (formData.rol === 'Cliente') {
          this.router.navigate(['/clientes']);
        } else {
          this.registerForm.reset({ rol: 'Cliente' });
        }
      },
      error: (err) => {
        this.errorMessage =
          err.error?.mensaje ||
          err.error?.error ||
          JSON.stringify(err.error) ||
          "Error al registrar usuario.";
        this.successMessage = "";
      }
    });
  }
}
