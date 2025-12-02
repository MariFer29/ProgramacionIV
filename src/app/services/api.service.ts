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
  
  ReporteTotales,
  ClienteTop,
  VolumenDiario,
  Auditoria,
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

  // Dejamos any[] para no romper el módulo de cuentas 
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
  getHistorialPorCliente(
    clienteId: number,
    filtros: {
      desde?: string;
      hasta?: string;
      tipo?: number | null;
      estado?: number | null;
      cuentaId?: string | null;
    }
  ): Observable<MovimientoHistorial[]> {
    const params: any = {};

    if (filtros.desde) {
      params.desde = filtros.desde;
    }
    if (filtros.hasta) {
      params.hasta = filtros.hasta;
    }
    if (filtros.tipo != null) {
      params.tipo = filtros.tipo; 
    }
    if (filtros.estado != null) {
      params.estado = filtros.estado; 
    }
    if (filtros.cuentaId) {
      params.cuentaId = filtros.cuentaId; 
    }

    return this.http.get<MovimientoHistorial[]>(
      `${this.baseUrl}/Historial/cliente/${clienteId}`,
      {
        params,
        ...this.getAuthHeaders(),
      }
    );
  }

  // ==============================
  // MÓDULO G – REPORTES
  // ==============================

  getReporteTotales(desde: string, hasta: string): Observable<ReporteTotales> {
    const params: any = { desde, hasta };

    return this.http.get<ReporteTotales>(`${this.baseUrl}/reportes/totales`, {
      params,
      ...this.getAuthHeaders(),
    });
  }

  getTopClientes(
    desde: string,
    hasta: string,
    top: number
  ): Observable<ClienteTop[]> {
    const params: any = {
      desde,
      hasta,
      top: top.toString(),
    };

    return this.http.get<ClienteTop[]>(`${this.baseUrl}/reportes/top-clientes`, {
      params,
      ...this.getAuthHeaders(),
    });
  }

  getVolumenDiario(
    desde: string,
    hasta: string
  ): Observable<VolumenDiario[]> {
    const params: any = { desde, hasta };

    return this.http.get<VolumenDiario[]>(
      `${this.baseUrl}/reportes/volumen-diario`,
      {
        params,
        ...this.getAuthHeaders(),
      }
    );
  }

  // ==============================
  // MÓDULO G – AUDITORÍA
  // ==============================

  getAuditoria(
    desde?: string,
    hasta?: string,
    usuarioId?: number | null,
    tipoOperacion?: string | null
  ): Observable<Auditoria[]> {
    const params: any = {};

    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (usuarioId != null) params.usuarioId = usuarioId.toString();
    if (tipoOperacion) params.tipoOperacion = tipoOperacion;

    return this.http.get<Auditoria[]>(`${this.baseUrl}/auditoria`, {
      params,
      ...this.getAuthHeaders(),
    });
  }


}
