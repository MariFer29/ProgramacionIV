import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
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

  submitLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.api.login(email, password).subscribe({
      next: (res) => {
        console.log('RESPUESTA LOGIN:', res);

        const token = res.token;
        localStorage.setItem('token', token);

        let rol: string | undefined = res.rol || res.role || res.Rol;

        if (!rol && token) {
          const data = this.decodeToken(token);
          console.log('PAYLOAD TOKEN:', data);
          if (data) {
            rol =
              data.rol ||
              data.role ||
              data.Rol ||
              data[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ];
          }
        }

        if (!rol) {
          rol = 'Cliente';
        }

        localStorage.setItem('rol', rol);
        console.log('ROL final guardado:', rol);

        this.errorMessage = '';
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas o usuario bloqueado.';
      },
    });
  }
}
