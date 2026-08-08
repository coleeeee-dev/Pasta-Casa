export function ContactPage() {
  const channels = [
    ['Mensaje', 'WhatsApp', 'Consultas y coordinación de pedidos', 'Canal próximamente'],
    ['Cámara', 'Instagram', 'Novedades, sabores y cocina en proceso', 'Perfil próximamente'],
    ['Carta', 'Correo', 'Consultas generales y propuestas', 'Dirección próximamente'],
    ['Reloj', 'Horarios de atención', 'Los días y horarios se publicarán acá', 'Información próximamente'],
  ]
  return <main className="inner-page"><section className="page-hero contact-hero"><p className="eyebrow">Hablemos</p><h1>Queremos estar <em>cerca de tu mesa.</em></h1><p>Estamos preparando nuestros canales oficiales. Muy pronto vas a poder escribirnos para consultar, encargar y conocer las novedades.</p></section><section className="contact-grid">{channels.map(([icon, title, copy, status]) => <article key={title}><span className="contact-icon" aria-hidden="true">{icon.slice(0, 1)}</span><div><h2>{title}</h2><p>{copy}</p><small>{status}</small></div></article>)}</section><section className="contact-note"><span>Mientras tanto</span><h2>El catálogo ya está listo para explorar</h2><p>Podés armar y registrar tu pedido desde la tienda. No se realizará ningún cobro automático ni se enviarán mensajes reales.</p><a className="button button-primary" href="/">Ver el catálogo</a></section></main>
}
