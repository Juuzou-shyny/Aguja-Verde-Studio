import { useApp } from '../../context/AppContext'
import Button from '../Button/Button'
import styles from './Cart.module.css'

export default function CartDrawer() {
  const { cart, cartOpen, cartTotal, setCartOpen, updateQty, removeFromCart, user } = useApp()

  return (
    <>
      <div className={`${styles.backdrop} ${cartOpen ? styles.backdropOpen : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`${styles.drawer} ${cartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Carrito</div>
            <div className={styles.countLabel}>
              {cart.length === 0 ? '0 artículos' : cart.reduce((s,i) => s+i.qty,0) === 1 ? '1 artículo' : `${cart.reduce((s,i) => s+i.qty,0)} artículos`}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)} aria-label="Cerrar carrito">✕</button>
        </div>

        <div className={styles.items}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272"/>
              </svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>IMG</div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>{(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
                  <div className={styles.itemQty}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className={styles.qtyVal}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.id, +1)}>+</button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} aria-label="Eliminar">✕</button>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>{cartTotal.toFixed(2).replace('.', ',')} €</span>
          </div>
          <Button variant="primary" fullWidth disabled={cart.length === 0}>
            Finalizar compra
          </Button>
        </div>
      </div>
    </>
  )
}
