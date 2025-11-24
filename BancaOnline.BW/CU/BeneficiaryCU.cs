using BancaOnline.BC.Entidades;
using BancaOnline.BC.Entities;
using BancaOnline.BC.Enums;
using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using Microsoft.EntityFrameworkCore;
using System;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;

namespace BancaOnline.BW.CU
{
    public class BeneficiaryCU : IBeneficiaryBW
    {
        private readonly AppDbContext _db;

        public BeneficiaryCU(AppDbContext db)
        {
            _db = db;
        }

        public async Task<BeneficiarioDTO> RegistrarAsync(RegistrarBeneficiarioDTO request)
        {
            var clienteExiste = await _db.Clientes.AnyAsync(c => c.Id == request.ClientId);
            if (!clienteExiste)
                throw new InvalidOperationException("El cliente no existe.");

            bool aliasEnUso = await _db.Beneficiaries
                .AnyAsync(b => b.ClientId == request.ClientId && b.Alias == request.Alias);

            if (aliasEnUso)
                throw new InvalidOperationException("Ya existe un beneficiario con ese alias para este cliente.");

            if (string.IsNullOrWhiteSpace(request.AccountNumber))
                throw new InvalidOperationException("El número de cuenta es requerido.");

            var beneficiary = new Beneficiary
            {
                Id = Guid.NewGuid(),
                ClientId = request.ClientId,
                Alias = request.Alias,
                Bank = request.Bank,
                Currency = request.Currency,
                AccountNumber = request.AccountNumber,
                Country = request.Country,
                Status = BeneficiaryStatus.PendingConfirmation,
                CreatedAt = DateTime.UtcNow
            };

            _db.Beneficiaries.Add(beneficiary);
            await _db.SaveChangesAsync();

            return MapToDto(beneficiary);
        }

        public async Task<BeneficiarioDTO?> ActualizarAsync(ActualizarBeneficiarioDTO request)
        {
            var beneficiary = await _db.Beneficiaries
                .FirstOrDefaultAsync(b => b.Id == request.Id);

            if (beneficiary == null)
                return null;

            bool aliasEnUso = await _db.Beneficiaries.AnyAsync(b =>
                b.ClientId == beneficiary.ClientId &&
                b.Id != beneficiary.Id &&
                b.Alias == request.Alias);

            if (aliasEnUso)
                throw new InvalidOperationException("Ya existe otro beneficiario con ese alias para este cliente.");

            beneficiary.Alias = request.Alias;
            beneficiary.Bank = request.Bank;
            beneficiary.Currency = request.Currency;
            beneficiary.AccountNumber = request.AccountNumber;
            beneficiary.Country = request.Country;
            beneficiary.Status = request.Status;

            await _db.SaveChangesAsync();

            return MapToDto(beneficiary);
        }

        public async Task<bool> EliminarAsync(Guid id)
        {
            var beneficiary = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == id);
            if (beneficiary == null)
                return false;

            _db.Beneficiaries.Remove(beneficiary);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ConfirmarAsync(Guid id)
        {
            var beneficiary = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == id);
            if (beneficiary == null)
                return false;

            if (beneficiary.Status == BeneficiaryStatus.Active)
                return true;

            beneficiary.Status = BeneficiaryStatus.Active;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<IReadOnlyList<BeneficiarioDTO>> ConsultarAsync(FiltroBeneficiariosDTO filtro)
        {
            IQueryable<Beneficiary> query = _db.Beneficiaries.AsQueryable();

            if (filtro.ClientId.HasValue)
                query = query.Where(b => b.ClientId == filtro.ClientId.Value);

            if (filtro.Status.HasValue)
                query = query.Where(b => b.Status == filtro.Status.Value);

            if (!string.IsNullOrWhiteSpace(filtro.Bank))
                query = query.Where(b => b.Bank == filtro.Bank);

            if (filtro.Currency.HasValue)
                query = query.Where(b => b.Currency == filtro.Currency.Value);

            var list = await query.OrderBy(b => b.Alias).ToListAsync();
            return list.Select(MapToDto).ToList();
        }

        private static BeneficiarioDTO MapToDto(Beneficiary b) =>
            new BeneficiarioDTO
            {
                Id = b.Id,
                ClientId = b.ClientId,
                Alias = b.Alias,
                Bank = b.Bank,
                Currency = b.Currency,
                AccountNumber = b.AccountNumber,
                Country = b.Country,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            };
    }
}
