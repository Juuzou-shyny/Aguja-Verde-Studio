const BASE = '/api'

export async function loginRequest({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Credenciales incorrectas')
  return res.json() // { token, name, email }
}

export async function registerRequest({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Error al registrarse')
  }
  return res.json()
}

export async function getProductos() {
  const res = await fetch(`${BASE}/productos`)
  if (!res.ok) throw new Error('Error cargando productos')
  return res.json()
}

export async function getPedidos(token) {
  const res = await fetch(`${BASE}/pedidos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error cargando pedidos')
  return res.json()
}

export async function crearPedido({ lineas, token }) {
  const res = await fetch(`${BASE}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lineas }),
  })
  if (!res.ok) throw new Error('Error al crear el pedido')
  return res.json()
}
