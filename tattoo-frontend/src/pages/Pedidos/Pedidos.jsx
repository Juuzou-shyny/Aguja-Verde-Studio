import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getPedidos } from '../../api/auth'
import styles from './Pedidos.module.css'

const ESTADO_LABEL = {
  pendiente:   { label: 'Pendiente',   color: '#c9a84c' },
  procesando:  { label: 'Procesando',  color: '#4ca8c9' },
  enviado:     { label: 'Enviado',     color: '#4cc97a' },
  entregado:   { label: 'Entregado',   color: '#4cc97a' },
  cancelado:   { label: 'Cancelado',   color: '#e05555' },
}

export default function Pedidos() {
  const { user } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.token) return
    getPedidos(user.token)
      .then(setPedidos)
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="section-label">Tu cuenta</span>
        <h1 className={styles.title}>MIS PEDIDOS</h1>
      </div>

      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3].map(n => <div key={n} className={styles.skeleton} />)}
        </div>
      ) : pedidos.length === 0 ? (
        <div className={styles.empty}>
          <p>Aún no tienes pedidos.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {pedidos.map(p => {
            const estado = ESTADO_LABEL[p.estado?.toLowerCase()] || { label: p.estado, color: 'var(--muted)' }
            return (
              <div key={p.id} className={styles.pedido}>
                <div className={styles.pedidoTop}>
                  <div>
                    <span className={styles.pedidoId}>Pedido #{p.id}</span>
                    <span className={styles.pedidoFecha}>{new Date(p.fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                  <span className={styles.pedidoEstado} style={{ color: estado.color, borderColor: estado.color }}>
                    {estado.label}
                  </span>
                </div>
                <div className={styles.pedidoLineas}>
                  {p.lineas?.map((l, i) => (
                    <div key={i} className={styles.linea}>
                      <span className={styles.lineaNombre}>{l.productoNombre || `Producto #${l.productoId}`}</span>
                      <span className={styles.lineaQty}>x{l.cantidad}</span>
                      <span className={styles.lineaPrecio}>{(l.precioUnitario * l.cantidad).toFixed(2).replace('.',',')} €</span>
                    </div>
                  ))}
                </div>
                <div className={styles.pedidoTotal}>
                  Total: <strong>{Number(p.total || p.lineas?.reduce((s,l) => s + l.precioUnitario * l.cantidad, 0) || 0).toFixed(2).replace('.',',')} €</strong>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
