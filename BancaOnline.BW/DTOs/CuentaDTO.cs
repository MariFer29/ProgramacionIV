using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class CuentaDTO
    {
        public Guid Id { get; set; }
        public string AccountNumber { get; set; } = null!;
        public AccountType Type { get; set; }
        public CurrencyType Currency { get; set; }
        public decimal Balance { get; set; }
        public AccountStatus Status { get; set; }
        public int ClientId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
