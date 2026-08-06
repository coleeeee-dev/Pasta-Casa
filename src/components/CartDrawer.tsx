import { useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { formatARS } from '../utils/currency'
import { CartIcon, CloseIcon } from './Icons'
import { CartLine } from './CartLine'

interface Props { open: boolean; onClose: () => void; onCheckout: () => void }
export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, count, total, notice, setQuantity, removeItem, clearCart, dismissNotice } = useCart()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (open) closeRef.current?.focus() }, [open])
  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll') }, [open])
  if (!open) return null
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="presentation">
    <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="panel-header"><div><p className="eyebrow">Tu selección</p><h2 id="cart-title">Mi pedido <span>{count || ''}</span></h2></div><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Cerrar carrito"><CloseIcon /></button></div>
      {notice && <div className="notice error" role="alert"><span>{notice}</span><button onClick={dismissNotice} aria-label="Cerrar aviso">×</button></div>}
      {items.length === 0 ? <div className="empty-state"><div className="empty-icon"><CartIcon /></div><h3>Tu mesa todavía está vacía</h3><p>Elegí tus pastas favoritas y las vamos reuniendo acá.</p><button className="button button-primary" onClick={onClose}>Explorar el catálogo</button></div> : <>
        <div className="cart-lines">{items.map((item) => <CartLine key={item.product.id} item={item} onSet={(q) => setQuantity(item.product.id, q)} onRemove={() => removeItem(item.product.id)} />)}</div>
        <div className="drawer-footer"><button className="text-button danger clear-cart" onClick={clearCart}>Vaciar carrito</button><div className="total-row"><span>Total <small>{count} {count === 1 ? 'unidad' : 'unidades'}</small></span><strong>{formatARS(total)}</strong></div><p className="payment-note">El pago no se realiza en este prototipo.</p><button className="button button-primary button-wide" disabled={!items.length} onClick={onCheckout}>Proceder con la compra <span>→</span></button></div>
      </>}
    </aside>
  </div>
}
