import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { crearSesionPago } from '../../api/auth'
import Input from '../Input/Input'
import Button from '../Button/Button'
import styles from './CheckoutModal.module.css'

export default function CheckoutModal({ open, onClose }) {
  const { user, cart, cartTotal, setCart, setCartOpen } = useApp()
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  if (!open) return null

  const handleConfirm = async () => {
    setError('')
    if (!direccion.trim()) { setError('La dirección es obligatoria.'); return }
    if (!telefono.trim())  { setError('El teléfono es obligatorio.'); return }

    setLoading(true)
    try {
      const lineas = cart.map(item => ({
        productoId: item.id,
        cantidad: item.qty
      }))

      const data = await crearSesionPago({
        direccion,
        telefono,
        lineas,
        token: user.token
      })

      // Redirigir a Stripe
      window.location.href = data.sessionUrl
    } catch (e) {
      setError(e.message || 'Error al procesar el pago.')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setDireccion('')
    setTelefono('')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={handleClose}>✕</button>

        <div className={styles.logo}>AGUJA VERDE</div>
        <div className={styles.subtitle}>Finalizar compra</div>

        {/* Resumen del pedido */}
        <div className={styles.resumen}>
          {cart.map(item => (
            <div key={item.id} className={styles.resumenItem}>
              <span className={styles.resumenNombre}>
                {item.name}
                {item.talla && <span className={styles.resumenTalla}> · {item.talla}</span>}
              </span>
              <span className={styles.resumenQty}>x{item.qty}</span>
              <span className={styles.resumenPrecio}>
                {(item.price * item.qty).toFixed(2).replace('.', ',')} €
              </span>
            </div>
          ))}
          <div className={styles.resumenTotal}>
            <span>Total</span>
            <span>{cartTotal.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>

        {/* Formulario */}
        <div className={styles.form}>
          <Input
            label="Dirección de envío"
            id="checkout-direccion"
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Calle, número, ciudad, código postal"
          />
          <Input
            label="Teléfono de contacto"
            id="checkout-telefono"
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="6XX XXX XXX"
          />
          {error && <div className={styles.error}>{error}</div>}
          <p className={styles.aviso}>
            Serás redirigido a la página segura de pago de Stripe.
          </p>
          <Button variant="primary" fullWidth onClick={handleConfirm} disabled={loading}>
            {loading ? 'Redirigiendo...' : `Pagar · ${cartTotal.toFixed(2).replace('.', ',')} €`}
          </Button>
        </div>
      </div>
    </div>
  )
}