using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using BancaOnline.BC.Entidades;   
using BancaOnline.DA;             
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using JwtClaim = System.Security.Claims.Claim;

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public JwtService(IConfiguration config, AppDbContext db)
    {
        _config = config;
        _db = db;
    }

    public string GenerarToken(Usuario usuario)
    {
        int? clienteId = _db.Set<Cliente>()
            .Where(c => c.UsuarioId == usuario.Id)
            .Select(c => (int?)c.Id)
            .FirstOrDefault();

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<JwtClaim>
        {
            new JwtClaim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new JwtClaim(ClaimTypes.Email, usuario.Email),
            new JwtClaim(ClaimTypes.Role, usuario.Rol)
        };

        if (clienteId.HasValue)
        {
            claims.Add(new JwtClaim("clienteId", clienteId.Value.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
