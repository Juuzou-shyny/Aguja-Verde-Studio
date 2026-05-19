import { useApp } from '../../context/AppContext'
import styles from './Perfil.module.css'

export default function Perfil() {
  const { user } = useApp()

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="section-label">Tu cuenta</span>
        <h1 className={styles.title}>MI PERFIL</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.avatarLarge}>{user?.name?.charAt(0).toUpperCase()}</div>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nombre</span>
            <span className={styles.infoValue}>{user?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
