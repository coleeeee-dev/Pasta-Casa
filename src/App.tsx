import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CartDrawer } from './components/CartDrawer'
import { CheckoutModal } from './components/CheckoutModal'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { useBusinessConfig } from './context/BusinessConfigContext'

function scrollToCatalog() {
  window.requestAnimationFrame(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

export default function App() {
  const { config } = useBusinessConfig()
  const location = useLocation()
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  useEffect(() => {
    document.title = config ? `${config.nombre_negocio} · Pastas frescas artesanales` : 'Pastas frescas artesanales'
  }, [config])
  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#catalogo') scrollToCatalog()
  }, [location.hash, location.pathname])
  const exploreCatalog = () => {
    setCartOpen(false)
    if (location.pathname === '/' && location.hash === '#catalogo') {
      scrollToCatalog()
      return
    }
    navigate('/#catalogo')
  }
  return <>
    <Header onCartOpen={() => setCartOpen(true)} />
    <Routes><Route path="/" element={<HomePage />} /><Route path="/quienes-somos" element={<AboutPage />} /><Route path="/contacto" element={<ContactPage />} /><Route path="/privacidad" element={<PrivacyPage />} /></Routes>
    <Footer />
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} onExploreCatalog={exploreCatalog} />
    <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onBackToCart={() => { setCheckoutOpen(false); setCartOpen(true) }} onFinished={() => { setCheckoutOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
  </>
}
