using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BC.Entidades
{
    public class Auditoria
    {
        public Guid Id { get; set; }

        public DateTime Fecha { get; set; }

        // Usuario que realizó la acción (puedes usar Email o Id de Usuario/Cliente)
        public int? UsuarioId { get; set; }
        public string? UsuarioEmail { get; set; }

        // "CrearUsuario", "AbrirCuenta", "Transferencia", "PagoServicio", "CambiarParametro"
        public string TipoOperacion { get; set; } = null!;

        // Entidad afectada (nombre lógico)
        public string Entidad { get; set; } = null!; // "Usuario", "Cuenta", "Transferencia", etc.

        // Id de la entidad afectada (string para flexibilidad)
        public string? EntidadId { get; set; }

        public string? DatosPrevios { get; set; }
        public string? DatosNuevos { get; set; }
    }
}
