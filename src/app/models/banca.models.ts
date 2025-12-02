// src/app/models/banca.models.ts

// ======================
// MÓDULO D
// ======================

// --- Transferencias ---
export interface Transferencia {
  id: string; // Guid
  cuentaOrigenId: string; // Guid
  cuentaDestinoId: string; // Guid
  terceroId?: string | null; // Guid?

  moneda: string; // "CRC", "USD"
  monto: number; // decimal

  comision: number; // decimal
  saldoAntes: number; // decimal
  saldoDespues: number; // decimal

  fechaCreacion: string; // DateTime (ISO)
  fechaEjecucion?: string | null; // DateTime?
  estado: number; // int (enum en backend)
  idempotencyKey?: string | null;
  razonFalla?: string | null;
}

// --- Transferencias programadas ---
export interface TransferenciaProgramada {
  id: string; // Guid
  cuentaOrigenId: string; // Guid
  cuentaDestinoId: string; // Guid
  terceroId?: string | null; // Guid?

  moneda: string;
  monto: number;

  fechaEjecucion: string; // DateTime
  fechaCreacion: string; // DateTime

  fechaEjecucionReal?: string | null; // DateTime?
  estado: number; // int (enum)
}

// --- Pago de servicio ---
export interface PagoServicio {
  id: string; // Guid
  proveedorId: string; // Guid
  cuentaOrigenId: string; // Guid

  numeroContrato: string;
  moneda: string; // "CRC", "USD"
  monto: number; // decimal

  fechaCreacion: string; // DateTime
  fechaProgramada?: string | null; // DateTime?
  fechaPago?: string | null; // DateTime?

  estado: number; // int (enum)
  referencia?: string | null;
  razonFalla?: string | null;
}

// --- Proveedor de servicio ---
export interface ProveedorServicio {
  id: string; // Guid
  nombre: string;

  minContrato?: number;
  maxContrato?: number;
  monedasAceptadas?: string;
  activo?: boolean;

  descripcion?: string | null;
  moneda?: string | null;
}

export interface Cuenta {
  id: string;

  accountNumber?: string;
  currency?: string;
  balance?: number;

  numeroCuenta?: string;
  moneda?: string;
  saldo?: number;

  tipo?: string;
  estado?: string | number;
  clientId?: number;
  clienteId?: number;
}

// ======================
// MÓDULO G – Auditoría
// ======================

// BC: Auditoria
export interface Auditoria {
  id: string; // Guid
  fecha: string; // DateTime (ISO)

  usuarioId?: number | null;
  usuarioEmail?: string | null;

  tipoOperacion: string; // "CrearUsuario", "AbrirCuenta", "Transferencia", etc.
  entidad: string; // "Usuario", "Cuenta", "Transferencia", etc.
  entidadId?: string | null;

  datosPrevios?: string | null; // normalmente JSON
  datosNuevos?: string | null; // normalmente JSON
}

// ======================
// MÓDULO F – Historial / Extractos
// ======================

// MovimientoHistorialDTO
export interface MovimientoHistorial {
  fecha: string; // DateTime
  tipo: string;

  transferenciaId?: string | null; // Guid?
  pagoServicioId?: string | null; // Guid?

  cuentaOrigenId: string; // Guid
  cuentaDestinoId?: string | null; // Guid?

  numeroCuentaOrigen?: string | null;
  numeroCuentaDestino?: string | null;

  monto: number; // decimal
  comision: number; // decimal
  estado: number; // int (enum)

  descripcion?: string | null;
}

// ExtractoMensualDTO
export interface ExtractoMensual {
  cuentaId: string; // Guid
  numeroCuenta: string;

  anio: number;
  mes: number;

  saldoInicial: number;
  saldoFinal: number;
  totalComisiones: number;

  movimientos: MovimientoHistorial[];
}

// HistorialFiltroDTO
export interface HistorialFiltro {
  desde?: string; // DateTime? -> ISO string
  hasta?: string; // DateTime? -> ISO string
  tipo?: number | null; // int?
  estado?: number | null; // int?
  cuentaId?: string | null; // Guid?
}

// ======================
// MÓDULO G – Reportes
// ======================

// ReporteTotalesDTO
export interface ReporteTotales {
  desde: string; // DateTime
  hasta: string; // DateTime
  totalOperaciones: number; // decimal
}

// ClienteTopDTO
export interface ClienteTop {
  clientId: number;
  nombreCliente: string;
  montoTotal: number; // decimal
}

// VolumenDiarioDTO
export interface VolumenDiario {
  dia: string; // DateTime
  montoTotal: number; // decimal
}
