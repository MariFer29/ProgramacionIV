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
// Módulo A: Usuarios / Clientes
builder.Services.AddScoped<IUsuariosRepositorioDA, UsuariosRepositorio>();
builder.Services.AddScoped<IClientesRepositorioDA, ClientesRepositorio>();

// Módulos D y E
builder.Services.AddScoped<ITransferenciaDA, TransferenciaDA>();
builder.Services.AddScoped<ITransferenciaProgramadaDA, TransferenciaProgramadaDA>();
builder.Services.AddScoped<IPagoServicioDA, PagoServicioDA>();
builder.Services.AddScoped<IProveedorServicioDA, ProveedorServicioDA>();

// ---------------------------------------------------------------------
// Casos de uso (BW)
// ---------------------------------------------------------------------
// Módulo D/E
builder.Services.AddScoped<ITransferenciaBW, TransferenciaCU>();
builder.Services.AddScoped<ITransferenciaProgramadaBW, TransferenciaProgramadaCU>();
builder.Services.AddScoped<IPagoServicioBW, PagoServicioCU>();
builder.Services.AddScoped<IProveedorServicioBW, ProveedorServicioCU>();

// Módulo A
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
// MVC + Swagger
// ---------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Banca Online API",
        Version = "v1"
    });

    // ==== ESTO AGREGA EL BOTÓN AUTHORIZE ====
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Autorización JWT usando Bearer. Ejemplo: Bearer {token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

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