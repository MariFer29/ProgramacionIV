using System;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.CU;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Acciones;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITransferenciaDA, TransferenciaDA>();
builder.Services.AddScoped<ITransferenciaProgramadaDA, TransferenciaProgramadaDA>();
builder.Services.AddScoped<IPagoServicioDA, PagoServicioDA>();
builder.Services.AddScoped<IProveedorServicioDA, ProveedorServicioDA>();

builder.Services.AddScoped<ITransferenciaBW, TransferenciaCU>();
builder.Services.AddScoped<ITransferenciaProgramadaBW, TransferenciaProgramadaCU>();
builder.Services.AddScoped<IPagoServicioBW, PagoServicioCU>();
builder.Services.AddScoped<IProveedorServicioBW, ProveedorServicioCU>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();   
app.Run();