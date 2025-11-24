using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class AbrirCuentaDTO
    {
        public int ClientId { get; set; }
        public AccountType Type { get; set; }
        public CurrencyType Currency { get; set; }

        public decimal InitialBalance { get; set; } = 0;
        public string? AccountNumber { get; set; }
    }
}
