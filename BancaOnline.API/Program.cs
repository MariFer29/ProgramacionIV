
using BancaOnline.BC.Entidades;
using BancaOnline.BW.CU;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Acciones;
using BancaOnline.DA.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ---------------------------------------------------------------------
// DbContext
// ---------------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// ---------------------------------------------------------------------
// Repositorios (DA)
// ---------------------------------------------------------------------
builder.Services.AddScoped<IUsuariosRepositorio, UsuariosRepositorio>();
builder.Services.AddScoped<IClientesRepositorio, ClientesRepositorio>();

builder.Services.AddScoped<ITransferenciaDA, TransferenciaDA>();
builder.Services.AddScoped<ITransferenciaProgramadaDA, TransferenciaProgramadaDA>();
builder.Services.AddScoped<IPagoServicioDA, PagoServicioDA>();
builder.Services.AddScoped<IProveedorServicioDA, ProveedorServicioDA>();

// ---------------------------------------------------------------------
// Casos de uso (BW)
// ---------------------------------------------------------------------
builder.Services.AddScoped<ITransferenciaBW, TransferenciaCU>();
builder.Services.AddScoped<ITransferenciaProgramadaBW, TransferenciaProgramadaCU>();
builder.Services.AddScoped<IPagoServicioBW, PagoServicioCU>();
builder.Services.AddScoped<IProveedorServicioBW, ProveedorServicioCU>();

// Módulo A: Usuarios y Clientes
builder.Services.AddScoped<RegistrarUsuarioCU>();
builder.Services.AddScoped<LoginCU>();
builder.Services.AddScoped<GestionClientesCU>();

// ---------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------
builder.Services.AddSingleton<JwtService>();

var jwtKey = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = configuration["Jwt:Issuer"],
        ValidAudience = configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
    };
});

// ---------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------------------------------------------------------
// App
// ---------------------------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
