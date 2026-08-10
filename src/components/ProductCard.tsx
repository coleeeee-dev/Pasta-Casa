import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { getMaxProductQuantity } from '../context/cartReducer'
import type { Product } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens } from '../utils/dozens'
import { getProductImage } from '../utils/productImages'

export function ProductCard({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const { addItem, setQuantity: setCartQuantity, items } = useCart()
  const inCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const [quantity, setQuantity] = useState(inCart || 1)
  const remaining = product.stock - inCart
  const maxQuantity = getMaxProductQuantity(items, product)
  const productImage = getProductImage(product.nombre)
  useEffect(() => setQuantity(inCart || 1), [inCart])
  const add = () => {
    if (inCart > 0) setCartQuantity(product.id, quantity)
    else addItem(product, quantity)
    onAdded()
  }
  return <article className="product-card">
    <div className="product-image-wrap">
      {productImage
        ? <img src={productImage} alt={product.nombre} className="product-image" loading="lazy" decoding="async" />
        : <div className="product-image product-image-fallback" aria-hidden="true" />}
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
          <select id={`quantity-${product.id}`} value={Math.min(quantity, Math.max(maxQuantity, 1))} onChange={(e) => setQuantity(Number(e.target.value))} disabled={maxQuantity === 0}>
            {Array.from({ length: Math.max(maxQuantity, 1) }, (_, i) => <option key={i + 1} value={i + 1}>{formatDozens(i + 1)}</option>)}
          </select>
          <button className="button button-primary" onClick={add} disabled={maxQuantity === 0}>{inCart > 0 ? 'Actualizar' : remaining === 0 ? 'Agotado' : 'Agregar'}</button>
        </div>
      </div>
    </div>
  </article>
}
