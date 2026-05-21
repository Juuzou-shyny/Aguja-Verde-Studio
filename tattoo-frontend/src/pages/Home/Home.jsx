import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import styles from './Home.module.css'
import alexFoto from '../../assets/Alex.jpg'
import { getProductos } from '../../api/auth'
import t1 from '../../assets/trabajos/trabajo1.jpg'
import t2 from '../../assets/trabajos/trabajo2.jpg'
import t3 from '../../assets/trabajos/trabajo3.jpg'
import t4 from '../../assets/trabajos/trabajo4.jpg'
import t5 from '../../assets/trabajos/trabajo5.jpg'

const TRABAJOS = [t1, t2, t3, t4, t5]

export default function Home() {
  const { addToCart } = useApp()
  const galleryRef = useRef(null)
  const merchRef   = useRef(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
      getProductos()
        .then(data => setProducts(data.filter(p => p.activo).slice(0, 5)))
        .catch(() => setProducts([]))
    }, [])

  // Drag to scroll
  useEffect(() => {
    const init = (el) => {
      if (!el) return
      let down = false, startX, scrollLeft
      const onDown  = e => { down = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft }
      const onLeave = () => { down = false }
      const onUp    = () => { down = false }
      const onMove  = e => {
        if (!down) return
        e.preventDefault()
        el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5
      }
      el.addEventListener('mousedown', onDown)
      el.addEventListener('mouseleave', onLeave)
      el.addEventListener('mouseup', onUp)
      el.addEventListener('mousemove', onMove)
      return () => {
        el.removeEventListener('mousedown', onDown)
        el.removeEventListener('mouseleave', onLeave)
        el.removeEventListener('mouseup', onUp)
        el.removeEventListener('mousemove', onMove)
      }
    }
    const c1 = init(galleryRef.current)
    const c2 = init(merchRef.current)
    return () => { c1?.(); c2?.() }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add(styles.revealed)
      })
    }, { threshold: 0.15 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.heroEyebrow}>Estudio de tatuajes · Alcoy</p>
          <h1 className={styles.heroTitle}>Aguja<br/><span>Verde</span></h1>
          <p className={styles.heroSub}>Arte permanente. Cada pieza, única. Cada historia, grabada para siempre.</p>
          <div className={styles.heroCtas}>
            <a href="#booking" className={styles.btnPrimary}>Reserva tu cita</a>
            <Link to="/tienda" className={styles.btnSecondary}>Ver tienda</Link>
          </div>
          <div className={styles.heroDeco}>
            <div className={styles.decoLine} />
            <span>Desde 2018</span>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroImgPlaceholder}>
            <span>Foto del estudio</span>
          </div>
        </div>
      </section>

      {/* ── SOBRE EL ARTISTA ── */}
      <section className={`${styles.about} gold-line`} id="about">
        <div className={styles.aboutImg}>
          <img src={alexFoto} alt="Alex Leo Martínez" className={styles.aboutImgPhoto} />
        </div>
        <div className={`${styles.aboutContent} ${styles.reveal}`} data-reveal>
          <span className="section-label">El artista</span>
          <h2 className="section-title">ALEX<br/>LEO<br/>MARTÍNEZ</h2>
          <p className={styles.aboutText}>
            Especializado en blackwork, new school y free hand, con una gran experiencia, aparte de ser titulado cómo ilustrador.
            Cada diseño nace de una conversación — nunca hay dos tatuajes iguales.
          </p>
          <div className={styles.stats}>
            <div><div className={styles.statNum}>7</div><div className={styles.statLabel}>Años experiencia</div></div>
            <div><div className={styles.statNum}>3</div><div className={styles.statLabel}>Estilos principales</div></div>
          </div>
        </div>
      </section>

      {/* ── GALERÍA ── */}
      <section className={styles.gallery} id="gallery">
        <div className={`${styles.galleryHeader} ${styles.reveal}`} data-reveal>
          <div>
            <span className="section-label">Portfolio</span>
            <h2 className="section-title">TRABAJOS<br/>RECIENTES</h2>
          </div>
          <a href="https://www.instagram.com/agujaverdetattoo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className={styles.galleryLink}>
            Ver Instagram →
          </a>
        </div>
        <div className={styles.galleryTrack} ref={galleryRef}>
          {TRABAJOS.map((foto, i) => (
            <div key={i} className={styles.galleryItem}>
              <img src={foto} alt={`Trabajo ${i + 1}`} className={styles.galleryImg} />
            </div>
          ))}
        </div>
      </section>

      {/* ── MERCHAN ── */}
      <div className={styles.merchTrack} ref={merchRef}>
        {products.map(p => (
          <div key={p.id} className={styles.merchCard}>
            {p.imagenUrl
              ? <img src={p.imagenUrl} alt={p.nombre} className={styles.merchCardImg} />
              : <div className={styles.merchCardImg}>Sin imagen</div>
            }
            <div className={styles.merchCardInfo}>
              <div className={styles.merchCardName}>{p.nombre}</div>
              <div className={styles.merchCardPrice}>{Number(p.precio).toFixed(2).replace('.',',')} €</div>
              <button className={styles.merchCardBtn} onClick={() => addToCart({ id: p.id, name: p.nombre, price: p.precio })}>
                Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOOKING ── */}
      <section className={styles.booking} id="booking">
        <div className={`${styles.bookingInner} ${styles.reveal}`} data-reveal>
          <span className="section-label">¿Listo para empezar?</span>
          <h2 className={styles.bookingTitle}>TU PRÓXIMO<br/><span>TATUAJE</span></h2>
          <p className={styles.bookingSub}>
            Cuéntanos tu idea. Te respondemos en menos de 24h y preparamos un diseño exclusivo para ti.
          </p>
          <div className={styles.bookingCtas}>
            <a href="https://wa.me/34XXXXXXXXX?text=Hola,%20quiero%20información%20para%20reservar%20una%20cita"
               target="_blank" rel="noreferrer" className={styles.btnPrimary}>
              Escríbenos por WhatsApp
            </a>
            <a href="mailto:sheilarechelloret@hotmail.com" className={styles.btnSecondary}>Enviar email</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Aguja Verde</div>
        <div className={styles.footerCopy}>© 2025 Aguja Verde · Alcoy</div>
        <a href="https://www.instagram.com/agujaverdetattoo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className={styles.footerSocial}>@AgujaVerde</a>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <a href="https://wa.me/34652875948?text=Hola,%20quiero%20información%20sobre%20el%20estudio"
         target="_blank" rel="noreferrer"
         className={styles.waFloat}
         aria-label="Contactar por WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  )
}
