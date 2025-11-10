using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface ITransferenciaProgramadaDA
    {
        Task<List<TransferenciaProgramada>> ListarAsync();
        Task<TransferenciaProgramada?> ObtenerAsync(Guid id);
        Task CrearAsync(TransferenciaProgramada entity);
        Task CancelarAsync(Guid id);
    }
}
