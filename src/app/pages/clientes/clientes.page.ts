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

  goToRegistrar() {
    this.router.navigate(['/registrar-usuario']);
  }

  goToMenu() {
    this.router.navigate(['/admin-menu']);
  }
}



