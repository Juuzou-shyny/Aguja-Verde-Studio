import styles from './Input.module.css'

export default function Input({ label, id, type = 'text', value, onChange, placeholder, autoComplete, error }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[styles.input, error ? styles.hasError : ''].join(' ')}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
