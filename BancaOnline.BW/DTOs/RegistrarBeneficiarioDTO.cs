using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class RegistrarBeneficiarioDTO
    {
        public int ClientId { get; set; }

        public string Alias { get; set; } = null!;
        public string Bank { get; set; } = null!;
        public CurrencyType Currency { get; set; }
        public string AccountNumber { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}
