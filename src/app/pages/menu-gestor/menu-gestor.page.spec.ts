import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuGestorPage } from './menu-gestor.page';

describe('MenuGestorPage', () => {
  let component: MenuGestorPage;
  let fixture: ComponentFixture<MenuGestorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuGestorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
