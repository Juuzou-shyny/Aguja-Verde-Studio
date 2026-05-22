import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getProductos } from '../../api/auth'
import styles from './Tienda.module.css'

export default function Tienda() {
  const { addToCart } = useApp()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getProductos()
      .then(data => setProducts(data.filter(p => p.activo)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="section-label">Tienda</span>
        <h1 className={styles.title}>MERCHAN</h1>
        <p className={styles.sub}>Piezas diseñadas en el estudio. Edición limitada.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {[1,2,3,4,5,6].map(n => <div key={n} className={styles.skeleton} />)}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p.id} className={styles.card}>
              {p.imagenUrl
              ? <img src={p.imagenUrl} alt={p.nombre} className={styles.cardImg} />
                : <div className={styles.cardImg}>Sin imagen</div>
              }
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{p.nombre}</div>
                <div className={styles.cardPrice}>{Number(p.precio).toFixed(2).replace('.',',')} €</div>
                <button className={styles.cardBtn} onClick={() => addToCart({ id: p.id, name: p.nombre, price: p.precio })}>
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
