import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-cliente',
  templateUrl: './menu-cliente.page.html',
  styleUrls: ['./menu-cliente.page.scss'],
  standalone: true,              
  imports: [IonicModule, CommonModule]
})
export class MenuClientePage {

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']); 
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  irAMisCuentas() {
    this.router.navigate(['/mis-cuentas']);
  }

  irAExtractos() {
  this.router.navigate(['/extractos']);
}

}


