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
    public class AccountCU : IAccountBW
    {
        private readonly AppDbContext _db;

        public AccountCU(AppDbContext db)
        {
            _db = db;
        }

        public async Task<CuentaDTO> AbrirCuentaAsync(AbrirCuentaDTO request)
        {
            var clienteExiste = await _db.Clientes.AnyAsync(c => c.Id == request.ClientId);
            if (!clienteExiste)
                throw new InvalidOperationException("El cliente no existe.");

            string accountNumber = request.AccountNumber ?? GenerarNumeroCuenta();

            if (accountNumber.Length != 12 || !accountNumber.All(char.IsDigit))
                throw new InvalidOperationException("El número de cuenta debe tener exactamente 12 dígitos.");

            bool numeroEnUso = await _db.Accounts.AnyAsync(a => a.AccountNumber == accountNumber);
            if (numeroEnUso)
                throw new InvalidOperationException("El número de cuenta ya existe.");

            var account = new Account
            {
                Id = Guid.NewGuid(),
                AccountNumber = accountNumber,
                Type = request.Type,
                Currency = request.Currency,
                Balance = request.InitialBalance,
                Status = AccountStatus.Active,
                ClientId = request.ClientId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Accounts.Add(account);
            await _db.SaveChangesAsync();

            return MapToDto(account);
        }

        public async Task<IReadOnlyList<CuentaDTO>> ConsultarCuentasAsync(FiltroCuentasDTO filtro)
        {
            IQueryable<Account> query = _db.Accounts.AsQueryable();

            if (filtro.ClientId.HasValue)
                query = query.Where(a => a.ClientId == filtro.ClientId);

            if (filtro.Type.HasValue)
                query = query.Where(a => a.Type == filtro.Type);

            if (filtro.Currency.HasValue)
                query = query.Where(a => a.Currency == filtro.Currency);

            if (filtro.Status.HasValue)
                query = query.Where(a => a.Status == filtro.Status);

            var list = await query.OrderBy(a => a.AccountNumber).ToListAsync();

            return list.Select(MapToDto).ToList();
        }

        public async Task<bool> BloquearCuentaAsync(Guid accountId)
        {
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null)
                return false;

            if (account.Status == AccountStatus.Closed)
                throw new InvalidOperationException("La cuenta ya está cerrada.");

            if (account.Status == AccountStatus.Blocked)
                return true;

            account.Status = AccountStatus.Blocked;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CerrarCuentaAsync(Guid accountId)
        {
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null)
                return false;

            if (account.Balance != 0)
                throw new InvalidOperationException("No se puede cerrar una cuenta con saldo distinto de cero.");

            account.Status = AccountStatus.Closed;
            await _db.SaveChangesAsync();
            return true;
        }

        private static string GenerarNumeroCuenta()
        {
            var random = new Random();
            return string.Concat(Enumerable.Range(0, 12).Select(_ => random.Next(0, 10)));
        }

        private static CuentaDTO MapToDto(Account a)
        {
            return new CuentaDTO
            {
                Id = a.Id,
                AccountNumber = a.AccountNumber,
                Type = a.Type,
                Currency = a.Currency,
                Balance = a.Balance,
                Status = a.Status,
                ClientId = a.ClientId,
                CreatedAt = a.CreatedAt
            };
        }
    }
}
