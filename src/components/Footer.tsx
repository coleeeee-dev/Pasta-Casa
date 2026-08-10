import { Link } from 'react-router-dom'

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <p className="footer-tagline">Pastas caseras para compartir.</p>
      <nav className="footer-links" aria-label="Navegación del pie de página">
        <Link to="/">Catálogo</Link>
        <Link to="/quienes-somos">Quiénes somos</Link>
        <Link to="/contacto">Contacto</Link>
      </nav>
      <p className="footer-note">Hecho en casa · Atención directa</p>
    </div>
  </footer>
}
