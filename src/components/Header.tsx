import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { CartIcon, MenuIcon } from './Icons'

export function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()
  const closeMenu = () => setMenuOpen(false)
  return <header className="site-header">
    <div className="header-inner">
      <NavLink className="brand" to="/" onClick={closeMenu} aria-label="Pasta Casa, ir al inicio">
        <span className="brand-mark">P</span><span><strong>Pasta Casa</strong><small>Pastas frescas</small></span>
      </NavLink>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
        <MenuIcon open={menuOpen} />
      </button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
        <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
        <NavLink to="/quienes-somos" onClick={closeMenu}>Quiénes somos</NavLink>
        <NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink>
      </nav>
      <button className="cart-button" onClick={onCartOpen} aria-label={`Abrir carrito, ${count} unidades`}>
        <CartIcon /><span className="cart-label">Tu pedido</span>{count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </div>
  </header>
}
