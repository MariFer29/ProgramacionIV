import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss']
})
export class ClientesPage implements OnInit {

  clientes: any[] = [];
  errorMessage: string = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.api.getClientes().subscribe({
      next: (res) => {
        this.clientes = res;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando clientes';
      }
    });
  }

  verDetalle(cliente: any) {
    this.router.navigate(['/cliente-detalle', cliente.id]);
  }

  goToMenu() {
    const rol = localStorage.getItem('rol')?.toLowerCase() || '';

    if (['admin', 'administrador', 'adm', '1', 'superadmin'].includes(rol)) {
      // Redirigir a menú admin
      this.router.navigate(['/admin-menu']);
    } else if (['gestor', 'manager', '2'].includes(rol)) {
      // Redirigir a menú gestor
      this.router.navigate(['/menu-gestor']);
    } else {
      // Por seguridad, si no reconoce el rol, redirigir a login
      this.router.navigate(['/login']);
    }
  }
}



