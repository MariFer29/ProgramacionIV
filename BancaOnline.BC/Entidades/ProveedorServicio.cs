using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BC.Entidades
{
    public class ProveedorServicio
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = default!;
        public int MinContrato { get; set; } = 8;
        public int MaxContrato { get; set; } = 12;
        public string MonedasAceptadas { get; set; } = "CRC,USD";
        public bool Activo { get; set; } = true;
    }
}
