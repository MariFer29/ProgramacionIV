import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientesDetallePage } from './clientes-detalle.page';

describe('ClientesDetallePage', () => {
  let component: ClientesDetallePage;
  let fixture: ComponentFixture<ClientesDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
