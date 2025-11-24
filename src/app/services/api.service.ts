import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = 'https://localhost:7192/api'; 

  constructor(private http: HttpClient) {}

  // Login
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.baseUrl}/usuarios/login`,
      { email, password }
    );
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
    return this.http.get(`${this.baseUrl}/clientes/${id}`, this.getAuthHeaders());
  }

  // Actualizar cliente
  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clientes/${id}`, data, this.getAuthHeaders());
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
