import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CartDrawer } from './components/CartDrawer'
import { CheckoutModal } from './components/CheckoutModal'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  return <>
    <Header onCartOpen={() => setCartOpen(true)} />
    <Routes><Route path="/" element={<HomePage />} /><Route path="/quienes-somos" element={<AboutPage />} /><Route path="/contacto" element={<ContactPage />} /></Routes>
    <Footer />
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} />
    <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onBackToCart={() => { setCheckoutOpen(false); setCartOpen(true) }} onFinished={() => { setCheckoutOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
  </>
}
