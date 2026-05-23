// PagoExitoso.jsx
export default function PagoExitoso() {
  return (
    <main style={{ padding: '160px 64px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--gold)' }}>
        ¡PAGO COMPLETADO!
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '20px' }}>
        Tu pedido ha sido confirmado. Te contactaremos pronto.
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: '40px', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
        ← Volver al inicio
      </a>
    </main>
  )
}

