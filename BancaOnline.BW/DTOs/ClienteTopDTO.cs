using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.DTOs
{
    public class ClienteTopDTO
    {
        public int ClientId { get; set; }
        public string NombreCliente { get; set; } = null!;
        public decimal MontoTotal { get; set; }
    }
}
