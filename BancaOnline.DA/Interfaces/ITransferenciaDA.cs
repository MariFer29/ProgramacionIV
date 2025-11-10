using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface ITransferenciaDA
    {
        Task<List<Transferencia>> ListarAsync();
        Task<Transferencia?> ObtenerAsync(Guid id);
        Task<bool> ExisteIdempotenciaAsync(string key);
        Task CrearAsync(Transferencia entity);
    }
}
