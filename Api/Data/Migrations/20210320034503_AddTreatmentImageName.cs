using Microsoft.EntityFrameworkCore.Migrations;

namespace Api.Migrations.PatientDb
{
    public partial class AddTreatmentImageName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TreatmentImageName",
                table: "Treatments",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TreatmentImageName",
                table: "Treatments");
        }
    }
}
