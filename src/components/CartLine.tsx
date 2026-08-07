import type { CartItem } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens } from '../utils/dozens'

interface Props { item: CartItem; onSet: (quantity: number) => void; onRemove: () => void }
export function CartLine({ item, onSet, onRemove }: Props) {
  return <div className="cart-line">
    <img src={item.product.imagen} alt="" />
    <div className="cart-line-main">
      <div className="cart-line-title"><div><strong>{item.product.nombre}</strong><small>{item.product.variante} · {formatDozens(item.quantity)}</small></div><button className="text-button danger" onClick={onRemove}>Eliminar</button></div>
      <div className="cart-line-bottom">
        <div className="stepper" aria-label={`Cantidad de ${item.product.nombre}`}>
          <button onClick={() => onSet(item.quantity - 1)} aria-label="Disminuir cantidad">−</button><span>{item.quantity}</span>
          <button onClick={() => onSet(item.quantity + 1)} disabled={item.quantity >= item.product.stock} aria-label="Aumentar cantidad">+</button>
        </div>
        <div className="line-price"><small>{formatARS(item.product.precio)} por docena</small><strong>Subtotal: {formatARS(item.product.precio * item.quantity)}</strong></div>
      </div>
    </div>
  </div>
}
