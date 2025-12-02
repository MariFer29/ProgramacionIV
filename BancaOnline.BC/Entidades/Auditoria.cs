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

        public int? UsuarioId { get; set; }
        public string? UsuarioEmail { get; set; }

        public string TipoOperacion { get; set; } = null!;

        public string Entidad { get; set; } = null!; 

        public string? EntidadId { get; set; }

        public string? DatosPrevios { get; set; }
        public string? DatosNuevos { get; set; }
    }
}
