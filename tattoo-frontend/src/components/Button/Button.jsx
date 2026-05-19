import styles from './Button.module.css'

export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled, fullWidth }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
