import { useBusinessConfig } from '../context/BusinessConfigContext'
import { buildWhatsAppUrl } from '../utils/whatsapp'

const whatsappMessage = 'Hola, quería hacer una consulta sobre las pastas.'

export function ContactPage() {
  const { config, loading } = useBusinessConfig()
  const whatsappUrl = config ? buildWhatsAppUrl(config.whatsapp, whatsappMessage) : null

  return <main className="inner-page contact-page">
    <header className="page-hero contact-hero">
      <p className="eyebrow">Hablemos</p>
      <h1>Estamos para <em>ayudarte.</em></h1>
      <p>Si querés hacer una consulta, coordinar un pedido o consultar una entrega, escribinos por WhatsApp.</p>
    </header>

    <section className="contact-grid" aria-label="Información de contacto">
      <article className="contact-card">
        <span className="contact-icon" aria-hidden="true">W</span>
        <div className="contact-card-content">
          <h2>WhatsApp</h2>
          <p>Consultas, pedidos y coordinación de entregas.</p>
          <strong className="contact-number" aria-live="polite">
            {config?.whatsapp ?? (loading ? 'Cargando…' : 'WhatsApp no disponible')}
          </strong>
          {whatsappUrl && <a className="button button-primary contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>}
        </div>
      </article>

      <article className="contact-card">
        <span className="contact-icon" aria-hidden="true">H</span>
        <div className="contact-card-content">
          <h2>Horarios de atención</h2>
          <p className="contact-days">Sábados y domingos</p>
          <div className="contact-hours" aria-label="Horarios de sábados y domingos">
            <span>9:00 <i aria-hidden="true">—</i> 12:00</span>
            <span>16:00 <i aria-hidden="true">—</i> 20:00</span>
          </div>
          <small>Fuera de estos horarios podés dejarnos tu mensaje y te responderemos cuando retomemos la atención.</small>
        </div>
      </article>
    </section>
  </main>
}
