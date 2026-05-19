import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { loginRequest, registerRequest } from '../../api/auth'
import Input from '../Input/Input'
import Button from '../Button/Button'
import styles from './Modal.module.css'

export default function LoginModal() {
  const { loginOpen, setLoginOpen, login } = useApp()
  const [tab, setTab]         = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Login form state
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName]         = useState('')
  const [regEmail, setRegEmail]       = useState('')
  const [regPassword, setRegPassword] = useState('')

  if (!loginOpen) return null

  const handleLogin = async () => {
    setError('')
    if (!loginEmail || !loginPassword) { setError('Rellena todos los campos.'); return }
    setLoading(true)
    try {
      const data = await loginRequest({ email: loginEmail, password: loginPassword })
      login({ name: data.name || loginEmail.split('@')[0], email: loginEmail, token: data.token })
    } catch (e) {
      setError(e.message || 'Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (!regName || !regEmail || !regPassword) { setError('Rellena todos los campos.'); return }
    if (regPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    try {
      const data = await registerRequest({ name: regName, email: regEmail, password: regPassword })
      login({ name: regName, email: regEmail, token: data.token })
    } catch (e) {
      setError(e.message || 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister()
    if (e.key === 'Escape') setLoginOpen(false)
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setLoginOpen(false)}>
      <div className={styles.modal} onKeyDown={handleKey} role="dialog" aria-modal="true">
        <button className={styles.close} onClick={() => setLoginOpen(false)} aria-label="Cerrar">✕</button>

        <div className={styles.logo}>INKHAUS</div>
        <div className={styles.subtitle}>Accede a tu cuenta</div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => { setTab('login'); setError('') }}>
            Entrar
          </button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => { setTab('register'); setError('') }}>
            Registrarse
          </button>
        </div>

        {tab === 'login' && (
          <div className={styles.form}>
            <Input label="Email" id="loginEmail" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="hola@ejemplo.com" autoComplete="email" />
            <Input label="Contraseña" id="loginPass" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            {error && <div className={styles.error}>{error}</div>}
            <Button variant="primary" fullWidth onClick={handleLogin} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        )}

        {tab === 'register' && (
          <div className={styles.form}>
            <Input label="Nombre" id="regName" type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
            <Input label="Email" id="regEmail" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="hola@ejemplo.com" autoComplete="email" />
            <Input label="Contraseña" id="regPass" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            {error && <div className={styles.error}>{error}</div>}
            <Button variant="primary" fullWidth onClick={handleRegister} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
