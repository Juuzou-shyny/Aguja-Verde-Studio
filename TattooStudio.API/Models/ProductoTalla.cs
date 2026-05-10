using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TattooStudio.API.Models;

[Table("producto_tallas")]
public class ProductoTalla
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("producto_id")]
    public int ProductoId { get; set; }

    [Column("talla")]
    public string Talla { get; set; } = string.Empty;

    [Column("stock")]
    public int Stock { get; set; } = 0;

    [JsonIgnore] // evita el ciclo
    public Producto Producto { get; set; } = null!;
}