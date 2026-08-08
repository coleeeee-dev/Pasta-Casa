import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><ProductProvider><CartProvider><App /></CartProvider></ProductProvider></BrowserRouter></StrictMode>)
