import emprendimientoPhoto from '../assets/branding/cara-emprendimiento.jpeg'
import { useBusinessConfig } from '../context/BusinessConfigContext'

const aboutContent = {
  eyebrow: 'DETRÁS DE CADA PEDIDO',
  title: 'Hola, soy Ulises González',
  introduction: 'Empecé este emprendimiento con la idea de preparar pastas caseras en pequeñas producciones y ofrecer una atención mucho más cercana y directa.',
  paragraphs: [
    'Me encargo personalmente de preparar y coordinar los pedidos, buscando que cada persona pueda disfrutar unas buenas pastas caseras para compartir en casa.',
    'Trabajamos con cantidades limitadas y cada pedido se coordina de manera personal.',
  ],
}

export function AboutPage() {
  const { config } = useBusinessConfig()
  const businessName = config?.nombre_negocio ?? 'este emprendimiento'

  return <main className="inner-page about-page">
    <header className="page-hero about-hero">
      <h1>Quiénes somos</h1>
    </header>

    <section className="about-feature" aria-labelledby="about-title">
      <div className="about-photo-wrap">
        <img src={emprendimientoPhoto} alt="Emprendimiento de pastas caseras" />
      </div>
      <div className="about-copy">
        <p className="eyebrow">{aboutContent.eyebrow}</p>
        <h2 id="about-title">{aboutContent.title}</h2>
        <p>Soy quien está detrás de {businessName}. {aboutContent.introduction}</p>
        {aboutContent.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
  </main>
}
