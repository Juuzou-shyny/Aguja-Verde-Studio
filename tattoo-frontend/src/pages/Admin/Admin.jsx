import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { getProductos, getPedidos } from '../../api/auth'
import styles from './Admin.module.css'

const TALLAS_OPCIONES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const CATEGORIAS = ['prenda', 'ilustracion', 'accesorio']

const EMPTY_PRODUCTO = {
  nombre: '', descripcion: '', precio: '', stock: '',
  categoria: 'prenda', tallas: []
}

export default function Admin() {
  const { user } = useApp()
  const [tab, setTab]               = useState('productos')
  const [productos, setProductos]   = useState([])
  const [pedidos, setPedidos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY_PRODUCTO)
  const [editingId, setEditingId]   = useState(null)
  const [imgFile, setImgFile]       = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState(null) // { type: 'ok'|'error', text }
  const fileRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [prods, peds] = await Promise.all([
        getProductos(),
        getPedidos(user.token)
      ])
      setProductos(prods)
      setPedidos(peds)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── FORM HELPERS ──
  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTalla = (talla, stock) => {
    setForm(f => {
      const existe = f.tallas.find(t => t.talla === talla)
      if (existe) {
        return { ...f, tallas: f.tallas.map(t => t.talla === talla ? { ...t, stock: Number(stock) } : t) }
      }
      return { ...f, tallas: [...f.tallas, { talla, stock: Number(stock) }] }
    })
  }

  const toggleTalla = (talla) => {
    setForm(f => {
      const existe = f.tallas.find(t => t.talla === talla)
      if (existe) return { ...f, tallas: f.tallas.filter(t => t.talla !== talla) }
      return { ...f, tallas: [...f.tallas, { talla, stock: 0 }] }
    })
  }

  const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setForm(EMPTY_PRODUCTO)
    setEditingId(null)
    setImgFile(null)
    setImgPreview(null)
  }

  const editarProducto = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      categoria: p.categoria,
      tallas: p.tallas?.map(t => ({ talla: t.talla, stock: t.stock })) || []
    })
    setEditingId(p.id)
    setImgPreview(p.imagenUrl ?? null)
    setImgFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  // ── GUARDAR PRODUCTO ──
  const guardarProducto = async () => {
    if (!form.nombre || !form.precio || !form.categoria) {
      flash('error', 'Nombre, precio y categoría son obligatorios.')
      return
    }
    setSaving(true)
    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        categoria: form.categoria,
        imagenUrl: null,
        tallas: form.tallas
      }

      let productoId = editingId

      if (editingId) {
        // PUT
        await fetch(`/api/productos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(body)
        }).then(r => { if (!r.ok) throw new Error() })
      } else {
        // POST
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error()
        const nuevo = await res.json()
        productoId = nuevo.id
      }

      // Subir imagen si hay una nueva
      if (imgFile && productoId) {
        const fd = new FormData()
        fd.append('archivo', imgFile)
        await fetch(`/api/productos/${productoId}/imagen`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: fd
        }).then(r => { if (!r.ok) throw new Error() })
      }

      flash('ok', editingId ? 'Producto actualizado.' : 'Producto creado.')
      resetForm()
      cargarDatos()
    } catch {
      flash('error', 'Error al guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  // ── DESACTIVAR PRODUCTO ──
  const desactivarProducto = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    try {
      await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
      flash('ok', 'Producto desactivado.')
      cargarDatos()
    } catch {
      flash('error', 'Error al desactivar.')
    }
  }

  const conTallas = form.categoria === 'prenda' || form.categoria === 'accesorio'

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className="section-label">Panel de administración</span>
        <h1 className={styles.title}>ADMIN</h1>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`${styles.flash} ${msg.type === 'ok' ? styles.flashOk : styles.flashError}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'productos' ? styles.tabActive : ''}`} onClick={() => setTab('productos')}>
          Productos
        </button>
        <button className={`${styles.tab} ${tab === 'pedidos' ? styles.tabActive : ''}`} onClick={() => setTab('pedidos')}>
          Pedidos {pedidos.length > 0 && <span className={styles.tabBadge}>{pedidos.length}</span>}
        </button>
      </div>

      {/* ── PRODUCTOS ── */}
      {tab === 'productos' && (
        <div className={styles.section}>
          {/* Formulario */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editingId ? `Editando producto #${editingId}` : 'Nuevo producto'}</h2>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>Nombre *</label>
                <input className={styles.input} value={form.nombre} onChange={e => handleField('nombre', e.target.value)} placeholder="Camiseta Aguja Verde"/>
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Categoría *</label>
                <select className={styles.input} value={form.categoria} onChange={e => handleField('categoria', e.target.value)}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Precio (€) *</label>
                <input className={styles.input} type="number" min="0" step="0.01" value={form.precio} onChange={e => handleField('precio', e.target.value)} placeholder="35.00"/>
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Stock general</label>
                <input className={styles.input} type="number" min="0" value={form.stock} onChange={e => handleField('stock', e.target.value)} placeholder="0"/>
              </div>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label className={styles.label}>Descripción</label>
                <textarea className={`${styles.input} ${styles.textarea}`} value={form.descripcion} onChange={e => handleField('descripcion', e.target.value)} placeholder="Descripción del producto..."/>
              </div>
            </div>

            {/* Tallas */}
            {conTallas && (
              <div className={styles.tallasSection}>
                <label className={styles.label}>Tallas y stock por talla</label>
                <div className={styles.tallas}>
                  {TALLAS_OPCIONES.map(t => {
                    const activa = form.tallas.find(x => x.talla === t)
                    return (
                      <div key={t} className={`${styles.tallaItem} ${activa ? styles.tallaActiva : ''}`}>
                        <button className={styles.tallaToggle} onClick={() => toggleTalla(t)}>{t}</button>
                        {activa && (
                          <input
                            className={styles.tallaStock}
                            type="number" min="0"
                            value={activa.stock}
                            onChange={e => handleTalla(t, e.target.value)}
                            placeholder="stock"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Imagen */}
            <div className={styles.imgSection}>
              <label className={styles.label}>Imagen del producto</label>
              <div className={styles.imgUpload} onClick={() => fileRef.current?.click()}>
                {imgPreview
                  ? <img src={imgPreview} alt="Preview" className={styles.imgPreview}/>
                  : <span className={styles.imgPlaceholder}>Haz clic para subir imagen</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImgChange} style={{ display: 'none' }}/>
            </div>

            {/* Acciones */}
            <div className={styles.formActions}>
              {editingId && (
                <button className={styles.btnSecondary} onClick={resetForm}>Cancelar</button>
              )}
              <button className={styles.btnPrimary} onClick={guardarProducto} disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>

          {/* Lista productos */}
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Productos activos ({productos.length})</h2>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[1,2,3].map(n => <div key={n} className={styles.skeleton}/>)}
            </div>
          ) : (
            <div className={styles.productosList}>
              {productos.map(p => (
                <div key={p.id} className={styles.productoRow}>
                  <div className={styles.productoImg}>
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre}/>
                      : <span>Sin foto</span>
                    }
                  </div>
                  <div className={styles.productoInfo}>
                    <div className={styles.productoNombre}>{p.nombre}</div>
                    <div className={styles.productoMeta}>
                      <span className={styles.tag}>{p.categoria}</span>
                      {p.tallas?.length > 0 && <span className={styles.tag}>{p.tallas.map(t => t.talla).join(' · ')}</span>}
                    </div>
                  </div>
                  <div className={styles.productoPrecio}>{Number(p.precio).toFixed(2).replace('.',',')} €</div>
                  <div className={styles.productoAcciones}>
                    <button className={styles.btnEdit} onClick={() => editarProducto(p)}>Editar</button>
                    <button className={styles.btnDelete} onClick={() => desactivarProducto(p.id)}>Desactivar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PEDIDOS ── */}
      {tab === 'pedidos' && (
        <div className={styles.section}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Todos los pedidos ({pedidos.length})</h2>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[1,2,3].map(n => <div key={n} className={styles.skeleton}/>)}
            </div>
          ) : pedidos.length === 0 ? (
            <div className={styles.empty}>No hay pedidos aún.</div>
          ) : (
            <div className={styles.pedidosList}>
              {pedidos.map(p => (
                <div key={p.id} className={styles.pedidoRow}>
                  <div className={styles.pedidoTop}>
                    <div>
                      <span className={styles.pedidoId}>Pedido #{p.id}</span>
                      <span className={styles.pedidoFecha}>{new Date(p.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <span className={`${styles.estado} ${styles[`estado_${p.estado?.toLowerCase()}`]}`}>
                      {p.estado}
                    </span>
                  </div>
                  <div className={styles.pedidoLineas}>
                    {p.lineas?.map((l, i) => (
                      <div key={i} className={styles.linea}>
                        <span>{l.productoNombre || `Producto #${l.productoId}`}</span>
                        <span className={styles.lineaQty}>x{l.cantidad}</span>
                        <span className={styles.lineaPrecio}>{(l.precioUnitario * l.cantidad).toFixed(2).replace('.',',')} €</span>
                      </div>
                    ))}
                  </div>
                  {p.usuarioEmail && (
                    <div className={styles.pedidoCliente}>Cliente: {p.usuarioEmail}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
