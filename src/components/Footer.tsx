import { Link } from 'react-router-dom'

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><div><span className="brand footer-brand"><span className="brand-mark">P</span><span><strong>Pasta Casa</strong><small>Pastas frescas</small></span></span><p>Hechas cerca. Compartidas en casa.</p></div><div className="footer-links"><Link to="/">Catálogo</Link><Link to="/quienes-somos">Quiénes somos</Link><Link to="/contacto">Contacto</Link></div><p className="footer-note">Prototipo de tienda · Sin pagos ni envíos reales</p></div></footer>
}
