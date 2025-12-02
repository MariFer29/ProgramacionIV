import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Transferencia,
  TransferenciaProgramada,
  PagoServicio,
  ProveedorServicio,
  MovimientoHistorial,
  ExtractoMensual,
  HistorialFiltro,
  Cuenta,
} from '../models/banca.models';

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

  getCuentas(clientId?: number) {
    let url = `${this.baseUrl}/cuentas`;

    if (clientId) {
      url += `?clientId=${clientId}`;
    }

    return this.http.get<any[]>(url, this.getAuthHeaders());
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

  getBeneficiarios(clientId?: number) {
    const options: any = {
      ...this.getAuthHeaders(),
    };

    if (clientId && clientId > 0) {
      options.params = { clientId: clientId.toString() };
    }

    return this.http.get<any[]>(`${this.baseUrl}/beneficiarios`, options);
  }

  crearBeneficiario(body: any) {
    return this.http.post(
      `${this.baseUrl}/beneficiarios`,
      body,
      this.getAuthHeaders()
    );
  }

  actualizarBeneficiario(body: {
    id: string;
    alias: string;
    bank: string;
    currency: number;
    accountNumber: string;
    country: string;
  }) {
    return this.http.put(
      `${this.baseUrl}/beneficiarios`,
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

  getTransferencias(): Observable<Transferencia[]> {
    return this.http.get<Transferencia[]>(
      `${this.baseUrl}/transferencias`,
      this.getAuthHeaders()
    );
  }

  // ==========================
  // PROVEEDORES DE SERVICIO
  // ==========================

  getProveedoresServicio(): Observable<ProveedorServicio[]> {
    return this.http.get<ProveedorServicio[]>(
      `${this.baseUrl}/ProveedoresServicio`,
      this.getAuthHeaders()
    );
  }

  crearProveedorServicio(body: {
    nombre: string;
    descripcion?: string;
    moneda: string;
  }): Observable<ProveedorServicio> {
    return this.http.post<ProveedorServicio>(
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
  }): Observable<PagoServicio> {
    return this.http.post<PagoServicio>(
      `${this.baseUrl}/PagoServicio`,
      body,
      this.getAuthHeaders()
    );
  }

  getPagosServicio(): Observable<PagoServicio[]> {
    return this.http.get<PagoServicio[]>(
      `${this.baseUrl}/PagoServicio`,
      this.getAuthHeaders()
    );
  }

  // ==============================
  // TRANSFERENCIAS PROGRAMADAS
  // ==============================

  getTransferenciasProgramadas(): Observable<TransferenciaProgramada[]> {
    return this.http.get<TransferenciaProgramada[]>(
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
  }): Observable<TransferenciaProgramada> {
    return this.http.post<TransferenciaProgramada>(
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

  // ==============================
  // HISTORIAL
  // ==============================
  getHistorialPorCliente(clienteId: number, filtros: HistorialFiltro) {
    const params: any = {};

    if (filtros.desde) {
      params.desde = filtros.desde;
    }
    if (filtros.hasta) {
      params.hasta = filtros.hasta;
    }
    if (filtros.tipo !== undefined && filtros.tipo !== null) {
      params.tipo = filtros.tipo;
    }
    if (filtros.estado !== undefined && filtros.estado !== null) {
      params.estado = filtros.estado;
    }
    if (filtros.cuentaId) {
      params.cuentaId = filtros.cuentaId;
    }

    return this.http.get<any[]>(
      `${this.baseUrl}/historial/cliente/${clienteId}`,
      {
        params,
        ...this.getAuthHeaders(),
      }
    );
  }

  getHistorialPorCuenta(cuentaId: string, filtros: HistorialFiltro) {
    const params: any = {};

    if (filtros.desde) {
      params.desde = filtros.desde;
    }
    if (filtros.hasta) {
      params.hasta = filtros.hasta;
    }
    if (filtros.tipo !== undefined && filtros.tipo !== null) {
      params.tipo = filtros.tipo;
    }
    if (filtros.estado !== undefined && filtros.estado !== null) {
      params.estado = filtros.estado;
    }

    return this.http.get<any[]>(
      `${this.baseUrl}/historial/cuenta/${cuentaId}`,
      {
        params,
        ...this.getAuthHeaders(),
      }
    );
  }

  // ==============================
  // COMPROBANTES (PDF)
  // ==============================

  downloadComprobanteTransferencia(id: string) {
    return this.http.get(`${this.baseUrl}/Comprobantes/transferencia/${id}`, {
      ...this.getAuthHeaders(),
      responseType: 'blob' as 'json',
    });
  }

  downloadComprobantePago(id: string) {
    return this.http.get(`${this.baseUrl}/Comprobantes/pago/${id}`, {
      ...this.getAuthHeaders(),
      responseType: 'blob' as 'json',
    });
  }

  // ==============================
  // EXTRACTOS
  // ==============================

  getExtractoMensual(cuentaId: string, anio: number, mes: number) {
    const params: any = { anio, mes };

    return this.http.get<ExtractoMensual>(
      `${this.baseUrl}/Historial/extracto/${cuentaId}`,
      {
        params,
        ...this.getAuthHeaders(),
      }
    );
  }

  downloadExtractoMensualPdf(cuentaId: string, anio: number, mes: number) {
    const params: any = {
      anio: anio.toString(),
      mes: mes.toString(),
    };

    return this.http.get(`${this.baseUrl}/Comprobantes/extracto/${cuentaId}`, {
      params,
      responseType: 'blob',
      ...this.getAuthHeaders(),
    });
  }
}
