using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BancaOnline.DA.Migrations
{
    /// <inheritdoc />
    public partial class AddSaldoPagosServicio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "SaldoAntes",
                table: "PagoServicio",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SaldoDespues",
                table: "PagoServicio",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SaldoAntes",
                table: "PagoServicio");

            migrationBuilder.DropColumn(
                name: "SaldoDespues",
                table: "PagoServicio");
        }
    }
}
