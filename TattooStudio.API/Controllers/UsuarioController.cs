using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TattooStudio.API.Data;

namespace TattooStudio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]  // todo el controller es solo admin
public class UsuariosController : ControllerBase
{
	private readonly AppDbContext _db;

	public UsuariosController(AppDbContext db)
	{
		_db = db;
	}

	// GET api/usuarios
	[HttpGet]
	public async Task<IActionResult> GetAll()
	{
		var usuarios = await _db.Usuarios
			.OrderBy(u => u.CreadoEn)
			.Select(u => new
			{
				u.Id,
				u.Email,
				u.Rol,
				u.CreadoEn
			})
			.ToListAsync();

		return Ok(usuarios);
	}

	// GET api/usuarios/5
	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(int id)
	{
		var usuario = await _db.Usuarios
			.Where(u => u.Id == id)
			.Select(u => new
			{
				u.Id,
				u.Email,
				u.Rol,
				u.CreadoEn
			})
			.FirstOrDefaultAsync();

		if (usuario == null)
			return NotFound(new { mensaje = "Usuario no encontrado" });

		return Ok(usuario);
	}

	// DELETE api/usuarios/5
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(int id)
	{
		var usuario = await _db.Usuarios.FindAsync(id);

		if (usuario == null)
			return NotFound(new { mensaje = "Usuario no encontrado" });

		// Evitar que el admin se elimine a sí mismo
		var emailActual = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
		if (usuario.Email == emailActual)
			return BadRequest(new { mensaje = "No puedes eliminar tu propio usuario" });

		_db.Usuarios.Remove(usuario);
		await _db.SaveChangesAsync();

		return NoContent();
	}
}