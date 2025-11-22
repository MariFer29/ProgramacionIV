using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BancaOnline.BW.DTOs;

namespace BancaOnline.BW.Interfaces
{
    public interface IAccountCU
    {
        Task<CuentaDTO> AbrirCuentaAsync(AbrirCuentaDTO request);
        Task<IReadOnlyList<CuentaDTO>> ConsultarCuentasAsync(FiltroCuentasDTO filtro);
        Task<bool> BloquearCuentaAsync(Guid accountId);
        Task<bool> CerrarCuentaAsync(Guid accountId);
    }
}
