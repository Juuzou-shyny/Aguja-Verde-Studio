import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import styles from './Nav.module.css'

export default function Nav() {
  const { user, logout, cartCount, setCartOpen, setLoginOpen } = useApp()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>Aguja Verde</Link>

      <ul className={styles.links}>
        <li><a href="/#about">Estudio</a></li>
        <li><a href="/#gallery">Trabajos</a></li>
        <li><Link to="/tienda">Tienda</Link></li>
        <li><a href="/#booking">Reserva</a></li>
      </ul>

      <div className={styles.actions}>
        {/* Carrito */}
        <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
          </svg>
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </button>

        {/* No logueado */}
        {!user && (
          <button className={styles.loginBtn} onClick={() => setLoginOpen(true)}>Entrar</button>
        )}

        {/* Logueado — menú de usuario */}
        {user && (
          <div className={styles.userMenu} ref={dropRef}>
            <button
              className={styles.userTrigger}
              onClick={() => setDropOpen(o => !o)}
              aria-expanded={dropOpen}
            >
              <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <span className={styles.userName}>{user.name}</span>
              <svg className={`${styles.chevron} ${dropOpen ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>

            {dropOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropHeader}>
                  <div className={styles.dropName}>{user.name}</div>
                  <div className={styles.dropEmail}>{user.email}</div>
                </div>
                <Link to="/pedidos" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
                  </svg>
                  Mis pedidos
                </Link>
                <Link to="/perfil" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                  Mi perfil
                </Link>
                <div className={styles.dropSep} />
                <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
