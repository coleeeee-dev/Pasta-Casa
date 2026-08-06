export function AboutPage() {
  const values = [
    ['01', 'Elaboración artesanal', 'Cada pieza respeta los tiempos y gestos de una cocina de verdad.'],
    ['02', 'Ingredientes seleccionados', 'Elegimos materias primas simples, frescas y de buena procedencia.'],
    ['03', 'Producción local', 'Hacemos cerca, en tandas pequeñas, para llegar siempre frescos a tu mesa.'],
  ]
  return <main className="inner-page"><section className="page-hero"><p className="eyebrow">Nuestra cocina</p><h1>Una historia que se amasa <em>todos los días.</em></h1><p>Próximamente vamos a compartir la historia del emprendimiento, las manos detrás de cada receta y el camino que nos trajo hasta acá.</p></section><section className="story-section"><div className="story-photo"><div className="story-placeholder"><span>Fotografía del obrador</span><small>Próximamente</small></div></div><div className="story-copy"><p className="eyebrow">Desde la primera receta</p><h2>La cocina como punto de encuentro</h2><p>Pasta Casa nace de una idea sencilla: recuperar el placer de sentarse a la mesa alrededor de un plato rico, cercano y hecho con dedicación.</p><p>Este espacio crecerá con nuestra historia, nuestros procesos y las personas que hacen posible cada tanda.</p></div></section><section className="values-grid">{values.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</section></main>
}
