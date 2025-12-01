import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'https://localhost:7192/api';

  constructor(private http: HttpClient) {}

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios/login`, {
      email,
      password,
    });
  }

  // Registrar usuario
  registrarUsuario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/registrar`, data);
  }

  // Obtener todos los clientes
  getClientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes`, this.getAuthHeaders());
  }

  // Obtener un cliente por id
  getCliente(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/clientes/${id}`,
      this.getAuthHeaders()
    );
  }

  // Actualizar cliente
  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/clientes/${id}`,
      data,
      this.getAuthHeaders()
    );
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // ==========================
  // Cuentas
  // ==========================

  getCuentas(clientId?: number): Observable<any[]> {
    const params: any = {};
    if (clientId) {
      params.clientId = clientId;
    }

    return this.http.get<any[]>(`${this.baseUrl}/cuentas`, {
      params,
      ...this.getAuthHeaders(),
    });
  }

  abrirCuenta(body: {
    clientId: number;
    type: number;
    currency: number;
    initialBalance: number;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/cuentas/abrir`,
      body,
      this.getAuthHeaders()
    );
  }

  bloquearCuenta(id: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/cuentas/bloquear/${id}`,
      {},
      this.getAuthHeaders()
    );
  }

  cerrarCuenta(id: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/cuentas/cerrar/${id}`,
      {},
      this.getAuthHeaders()
    );
  }

  // ============================
  //   BENEFICIARIOS / TERCEROS
  // ============================
  // OJO: si en tu backend la ruta es /terceros, cambia 'beneficiarios' por 'terceros'

  getBeneficiarios() {
    return this.http.get<any[]>(
      `${this.baseUrl}/beneficiarios`,
      this.getAuthHeaders()
    );
  }

  crearBeneficiario(body: any) {
    return this.http.post(
      `${this.baseUrl}/beneficiarios`,
      body,
      this.getAuthHeaders()
    );
  }

  actualizarBeneficiario(id: string, body: any) {
    return this.http.put(
      `${this.baseUrl}/beneficiarios/${id}`,
      body,
      this.getAuthHeaders()
    );
  }

  eliminarBeneficiario(id: string) {
    return this.http.delete(
      `${this.baseUrl}/beneficiarios/${id}`,
      this.getAuthHeaders()
    );
  }

  // ==========================
  // TRANSFERENCIAS
  // ==========================

  crearTransferencia(body: {
    cuentaOrigenId: string;
    cuentaDestinoId: string;
    monto: number;
    moneda: string;
    idempotencyKey?: string;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/transferencias`,
      body,
      this.getAuthHeaders()
    );
  }

  getTransferencias(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/transferencias`,
      this.getAuthHeaders()
    );
  }

  // ==========================
  // PROVEEDORES DE SERVICIO
  // ==========================

  getProveedoresServicio() {
    return this.http.get<any[]>(
      `${this.baseUrl}/ProveedoresServicio`,
      this.getAuthHeaders()
    );
  }

  crearProveedorServicio(body: {
    nombre: string;
    descripcion?: string;
    moneda: string;
  }) {
    return this.http.post(
      `${this.baseUrl}/ProveedoresServicio`,
      body,
      this.getAuthHeaders()
    );
  }

  // ==========================
  // PAGOS DE SERVICIO
  // ==========================

  crearPagoServicio(body: {
    proveedorId: string;
    cuentaOrigenId: string;
    numeroContrato: string;
    moneda: string;
    monto: number;
    fechaProgramada?: string | null;
  }) {
    return this.http.post(
      `${this.baseUrl}/PagoServicio`,
      body,
      this.getAuthHeaders()
    );
  }

  getPagosServicio() {
    return this.http.get<any[]>(
      `${this.baseUrl}/PagoServicio`,
      this.getAuthHeaders()
    );
  }

  // ==============================
  // TRANSFERENCIAS PROGRAMADAS
  // ==============================

  getTransferenciasProgramadas() {
    return this.http.get<any[]>(
      `${this.baseUrl}/TransferenciasProgramadas`,
      this.getAuthHeaders()
    );
  }

  crearTransferenciaProgramada(body: {
    cuentaOrigenId: string;
    cuentaDestinoId: string;
    monto: number;
    moneda: string;
    fechaEjecucion: string; // ISO string
  }) {
    return this.http.post(
      `${this.baseUrl}/TransferenciasProgramadas`,
      body,
      this.getAuthHeaders()
    );
  }

  cancelarTransferenciaProgramada(id: string) {
    return this.http.put(
      `${this.baseUrl}/TransferenciasProgramadas/cancelar/${id}`,
      {},
      this.getAuthHeaders()
    );
  }
}
