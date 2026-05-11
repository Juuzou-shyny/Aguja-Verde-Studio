using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TattooStudio.API.Data;
using TattooStudio.API.Models;

namespace TattooStudio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductosController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/productos — público
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var productos = await _db.Productos
            .Include(p => p.Tallas)
            .Where(p => p.Activo)
            .OrderByDescending(p => p.CreadoEn)
            .ToListAsync();

        return Ok(productos);
    }

    // GET api/productos/5 — público
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await _db.Productos
            .Include(p => p.Tallas)
            .FirstOrDefaultAsync(p => p.Id == id && p.Activo);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        return Ok(producto);
    }

    // POST api/productos — solo admin
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductoRequest request)
    {
        var producto = new Producto
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            Precio = request.Precio,
            Stock = request.Stock,
            Categoria = request.Categoria,
            ImagenUrl = request.ImagenUrl,
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();

        // Añadir tallas si es prenda o accesorio
        if (request.Tallas != null && request.Tallas.Any())
        {
            foreach (var t in request.Tallas)
            {
                _db.ProductoTallas.Add(new ProductoTalla
                {
                    ProductoId = producto.Id,
                    Talla = t.Talla,
                    Stock = t.Stock
                });
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, producto);
    }

    // PUT api/productos/5 — solo admin
    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoRequest request)
    {
        var producto = await _db.Productos
            .Include(p => p.Tallas)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.Precio = request.Precio;
        producto.Stock = request.Stock;
        producto.Categoria = request.Categoria;
        producto.ImagenUrl = request.ImagenUrl;

        // Actualizar tallas
        if (request.Tallas != null)
        {
            _db.ProductoTallas.RemoveRange(producto.Tallas);
            foreach (var t in request.Tallas)
            {
                _db.ProductoTallas.Add(new ProductoTalla
                {
                    ProductoId = producto.Id,
                    Talla = t.Talla,
                    Stock = t.Stock
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(producto);
    }

    // DELETE api/productos/5 — solo admin (soft delete)
    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _db.Productos.FindAsync(id);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        producto.Activo = false;
        await _db.SaveChangesAsync();

        return Ok(new { mensaje = "Producto desactivado" });
    }
}

// DTOs
public record TallaRequest(string Talla, int Stock);

public record ProductoRequest(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    string Categoria,
    string? ImagenUrl,
    List<TallaRequest>? Tallas
);