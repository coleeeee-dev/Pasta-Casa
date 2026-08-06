import { useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { products } from '../data/products'

export function HomePage() {
  const [message, setMessage] = useState('')
  const notify = () => { setMessage('Producto agregado a tu pedido'); window.setTimeout(() => setMessage(''), 2300) }
  return <main>
    {message && <div className="toast" role="status">✓ {message}</div>}
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow hero-eyebrow">El sabor de lo hecho en casa</p><h1>Pastas frescas para <em>compartir sin apuro.</em></h1><p>Recetas artesanales, ingredientes nobles y ese punto justo de harina en la mesada.</p><a className="button button-primary" href="#catalogo">Ver nuestras pastas <span>↓</span></a><div className="hero-trust"><span>◌ Elaboración artesanal</span><span>◇ Producción local</span><span>⌁ Listas en minutos</span></div></div>
      <div className="hero-visual" aria-label="Ilustración de pasta fresca"><div className="sun-shape" /><div className="plate"><div className="pasta-swirl"><i /><i /><i /><i /><i /></div><span className="leaf leaf-one" /><span className="leaf leaf-two" /></div><div className="flour flour-one">✦</div><div className="flour flour-two">·</div><p><span>Hechas hoy</span><strong>como en casa</strong></p></div>
    </section>
    <section className="catalog-section" id="catalogo">
      <div className="section-heading"><div><p className="eyebrow">Elegí tu favorita</p><h2>La mesa está servida</h2></div><p>Calculamos una caja de 500 g para 2 o 3 porciones, según el acompañamiento.</p></div>
      <div className="product-grid">{products.filter((p) => p.activo).map((product) => <ProductCard key={product.id} product={product} onAdded={notify} />)}</div>
    </section>
    <section className="promise-band"><div><span className="promise-number">01</span><h3>Elegís</h3><p>Armá tu pedido con las pastas que más te gusten.</p></div><div><span className="promise-number">02</span><h3>Confirmás</h3><p>Revisá las cantidades y completá tus datos.</p></div><div><span className="promise-number">03</span><h3>Disfrutás</h3><p>En la versión final coordinaremos pago y entrega.</p></div></section>
  </main>
}
