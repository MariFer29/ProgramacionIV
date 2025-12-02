import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-gestor',
  templateUrl: './menu-gestor.page.html',
  styleUrls: ['./menu-gestor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MenuGestorPage {

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']); 
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}

