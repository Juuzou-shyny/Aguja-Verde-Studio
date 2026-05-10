using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TattooStudio.API.Data;
using TattooStudio.API.Models;

namespace TattooStudio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _db;

    public PedidosController(AppDbContext db)
    {
        _db = db;
    }

    // POST api/pedidos — público, crea un pedido
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PedidoRequest request)
    {
        if (request.Lineas == null || !request.Lineas.Any())
            return BadRequest(new { mensaje = "El pedido debe tener al menos una línea" });

        decimal total = 0;
        var lineas = new List<LineaPedido>();

        foreach (var linea in request.Lineas)
        {
            var producto = await _db.Productos.FindAsync(linea.ProductoId);
            if (producto == null || !producto.Activo)
                return BadRequest(new { mensaje = $"Producto {linea.ProductoId} no encontrado" });

            // Verificar stock
            if (linea.ProductoTallaId.HasValue)
            {
                var talla = await _db.ProductoTallas.FindAsync(linea.ProductoTallaId.Value);
                if (talla == null || talla.Stock < linea.Cantidad)
                    return BadRequest(new { mensaje = $"Stock insuficiente para talla {talla?.Talla}" });

                talla.Stock -= linea.Cantidad;
            }
            else
            {
                if (producto.Stock < linea.Cantidad)
                    return BadRequest(new { mensaje = $"Stock insuficiente para {producto.Nombre}" });

                producto.Stock -= linea.Cantidad;
            }

            total += producto.Precio * linea.Cantidad;

            lineas.Add(new LineaPedido
            {
                ProductoId = linea.ProductoId,
                ProductoTallaId = linea.ProductoTallaId,
                Cantidad = linea.Cantidad,
                PrecioUnitario = producto.Precio
            });
        }

        var pedido = new Pedido
        {
            NombreCliente = request.NombreCliente,
            EmailCliente = request.EmailCliente,
            Direccion = request.Direccion,
            Total = total,
            Estado = "pendiente",
            CreadoEn = DateTime.UtcNow,
            Lineas = lineas
        };

        _db.Pedidos.Add(pedido);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, new
        {
            pedido.Id,
            pedido.NombreCliente,
            pedido.EmailCliente,
            pedido.Direccion,
            pedido.Total,
            pedido.Estado,
            pedido.CreadoEn,
            lineas = pedido.Lineas.Select(l => new
            {
                l.ProductoId,
                l.ProductoTallaId,
                l.Cantidad,
                l.PrecioUnitario
            })
        });
    }

    // GET api/pedidos — solo admin
    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var pedidos = await _db.Pedidos
            .Include(p => p.Lineas)
            .OrderByDescending(p => p.CreadoEn)
            .ToListAsync();

        return Ok(pedidos.Select(p => new
        {
            p.Id,
            p.NombreCliente,
            p.EmailCliente,
            p.Direccion,
            p.Total,
            p.Estado,
            p.CreadoEn,
            lineas = p.Lineas.Select(l => new
            {
                l.ProductoId,
                l.ProductoTallaId,
                l.Cantidad,
                l.PrecioUnitario
            })
        }));
    }

    // GET api/pedidos/5 — solo admin
    [Authorize(Roles = "admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await _db.Pedidos
            .Include(p => p.Lineas)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pedido == null)
            return NotFound(new { mensaje = "Pedido no encontrado" });

        return Ok(new
        {
            pedido.Id,
            pedido.NombreCliente,
            pedido.EmailCliente,
            pedido.Direccion,
            pedido.Total,
            pedido.Estado,
            pedido.CreadoEn,
            lineas = pedido.Lineas.Select(l => new
            {
                l.ProductoId,
                l.ProductoTallaId,
                l.Cantidad,
                l.PrecioUnitario
            })
        });
    }

    // PATCH api/pedidos/5/estado — solo admin
    [Authorize(Roles = "admin")]
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> UpdateEstado(int id, [FromBody] EstadoRequest request)
    {
        var pedido = await _db.Pedidos.FindAsync(id);
        if (pedido == null)
            return NotFound(new { mensaje = "Pedido no encontrado" });

        var estadosValidos = new[] { "pendiente", "pagado", "enviado", "cancelado" };
        if (!estadosValidos.Contains(request.Estado))
            return BadRequest(new { mensaje = "Estado no válido" });

        pedido.Estado = request.Estado;
        await _db.SaveChangesAsync();

        return Ok(new { pedido.Id, pedido.Estado });
    }
}

// DTOs
public record LineaPedidoRequest(int ProductoId, int? ProductoTallaId, int Cantidad);

public record PedidoRequest(
    string NombreCliente,
    string EmailCliente,
    string Direccion,
    List<LineaPedidoRequest> Lineas
);

public record EstadoRequest(string Estado);