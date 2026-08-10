import { useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'

export function HomePage() {
  const [message, setMessage] = useState('')
  const { products, loading, error, reloadProducts } = useProducts()
  const notify = () => { setMessage('Producto agregado a tu pedido'); window.setTimeout(() => setMessage(''), 2300) }

  return <main>
    {message && <div className="toast" role="status">✓ {message}</div>}

    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">Pastas caseras · Hechas con dedicación</p>
        <h1>El sabor de <em>lo hecho en casa</em></h1>
        <p>Sorrentinos caseros preparados en pequeñas producciones, con tres rellenos para elegir y pedidos simples para disfrutar el fin de semana.</p>
        <a className="button button-primary" href="#catalogo">Ver nuestras pastas <span aria-hidden="true">↓</span></a>
        <div className="hero-trust" aria-label="Características del emprendimiento"><span>Producción en pequeñas tandas</span><span>Venta por docena</span><span>Atención directa</span></div>
      </div>
      <div className="hero-visual" aria-label="Ilustración de pastas caseras">
        <div className="sun-shape" /><div className="plate"><div className="pasta-swirl"><i /><i /><i /><i /><i /></div><span className="leaf leaf-one" /><span className="leaf leaf-two" /></div><div className="flour flour-one">✦</div><div className="flour flour-two">·</div><p><span>Pequeñas tandas</span><strong>hechas con dedicación</strong></p>
      </div>
    </section>

    <section className="catalog-section" id="catalogo">
      <div className="section-heading"><div><p className="eyebrow">Elegí tu favorita</p><h2>Nuestros sorrentinos</h2></div><p>Elegí tu relleno favorito. Todos nuestros sorrentinos se venden por docena y preparamos cantidades limitadas.</p></div>
      {loading ? <div className="catalog-status" role="status" aria-live="polite"><span className="catalog-spinner" aria-hidden="true" /><h3>Cargando el catálogo…</h3><p>Estamos buscando las pastas disponibles.</p></div>
        : error ? <div className="catalog-status catalog-error" role="alert"><h3>No pudimos cargar el catálogo</h3><p>{error}</p><button className="button button-secondary" onClick={reloadProducts}>Reintentar</button></div>
          : products.length === 0 ? <div className="catalog-status"><h3>No hay productos disponibles</h3><p>En este momento no tenemos productos activos en el catálogo.</p></div>
            : <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdded={notify} />)}</div>}
    </section>

    <section className="promise-band" aria-label="Cómo hacer tu pedido"><div><span className="promise-number">01</span><h3>Elegís</h3><p>Seleccioná tus sorrentinos y armá tu pedido.</p></div><div><span className="promise-number">02</span><h3>Confirmás</h3><p>Completá tus datos y elegí cómo preferís pagar.</p></div><div><span className="promise-number">03</span><h3>Coordinamos</h3><p>Te indicamos los próximos pasos y coordinamos la entrega por WhatsApp.</p></div></section>
  </main>
}
