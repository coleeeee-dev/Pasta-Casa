import { useState } from 'react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens } from '../utils/dozens'

export function ProductCard({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, items } = useCart()
  const inCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const remaining = product.stock - inCart
  const add = () => { addItem(product, quantity); onAdded(); setQuantity(1) }
  return <article className="product-card">
    <div className="product-image-wrap">
      {product.imagen
        ? <img src={product.imagen} alt={`Presentación de ${product.nombre}`} className="product-image" />
        : <div className="product-image product-image-placeholder" aria-hidden="true"><span>Pasta Casa</span></div>}
      <span className="stock-pill">{remaining > 0 ? `${formatDozens(remaining)} disponibles` : 'Sin stock'}</span>
    </div>
    <div className="product-body">
      <p className="eyebrow">{product.presentacion}</p>
      <h3>{product.nombre}</h3>
      <p className="description">{product.descripcion}</p>
      <div className="product-footer">
        <strong className="price">{formatARS(product.precio)} <small>por docena</small></strong>
        <div className="add-row">
          <label className="sr-only" htmlFor={`quantity-${product.id}`}>Cantidad de docenas de {product.nombre}</label>
          <select id={`quantity-${product.id}`} value={Math.min(quantity, Math.max(remaining, 1))} onChange={(e) => setQuantity(Number(e.target.value))} disabled={remaining === 0}>
            {Array.from({ length: Math.max(remaining, 1) }, (_, i) => <option key={i + 1} value={i + 1}>{formatDozens(i + 1)}</option>)}
          </select>
          <button className="button button-primary" onClick={add} disabled={remaining === 0}>{remaining === 0 ? 'Agotado' : 'Agregar'}</button>
        </div>
      </div>
    </div>
  </article>
}
