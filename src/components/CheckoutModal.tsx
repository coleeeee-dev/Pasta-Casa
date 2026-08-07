import { useMemo, useState } from 'react'
import { useCart } from '../context/CartContext'
import { simulateOrderEmail } from '../services/emailService'
import type { CustomerData, Order } from '../types'
import { formatARS } from '../utils/currency'
import { createOrder } from '../utils/order'
import { validateCustomer, type CustomerErrors } from '../utils/validation'
import { formatDozens, formatFullProductName } from '../utils/dozens'
import { CloseIcon } from './Icons'

const emptyCustomer: CustomerData = { nombre: '', apellido: '', dni: '', email: '', reviewed: false }
interface Props { open: boolean; onClose: () => void; onBackToCart: () => void; onFinished: () => void }

export function CheckoutModal({ open, onClose, onBackToCart, onFinished }: Props) {
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [order, setOrder] = useState<Order | null>(null)
  const preview = useMemo(() => order ? simulateOrderEmail(order) : null, [order])
  if (!open) return null

  const update = (field: keyof CustomerData, value: string | boolean) => {
    setCustomer((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }
  const confirm = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validateCustomer(customer)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const nextOrder = createOrder(customer, items)
    setOrder(nextOrder); simulateOrderEmail(nextOrder); clearCart(); setStep(3)
  }
  const finish = () => { setStep(1); setCustomer(emptyCustomer); setOrder(null); setErrors({}); onFinished() }
  const safeClose = () => { if (step === 3) finish(); else onClose() }
  return <div className="overlay modal-overlay" role="presentation">
    <section className="checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="panel-header checkout-header">
        <div><p className="eyebrow">Compra segura · Simulación</p><h2 id="checkout-title">{step === 1 ? 'Revisá tu pedido' : step === 2 ? 'Tus datos' : '¡Pedido recibido!'}</h2></div>
        <button className="icon-button" onClick={safeClose} aria-label="Cerrar checkout"><CloseIcon /></button>
      </div>
      <div className="progress" aria-label={`Paso ${step} de 3`}><span className={step >= 1 ? 'active' : ''}>1 <em>Resumen</em></span><i /><span className={step >= 2 ? 'active' : ''}>2 <em>Datos</em></span><i /><span className={step >= 3 ? 'active' : ''}>3 <em>Listo</em></span></div>
      <div className="checkout-content">
        {step === 1 && <div className="summary-step">
          <div className="summary-list">{items.map(({ product, quantity }) => <div className="summary-item" key={product.id}><img src={product.imagen} alt="" /><div><strong>{product.nombre}</strong><small>{product.variante} · {formatDozens(quantity)} · {formatARS(product.precio)} por docena</small></div><span>{formatARS(product.precio * quantity)}</span></div>)}</div>
          <div className="summary-total"><span>Total del pedido</span><strong>{formatARS(total)}</strong></div>
          <div className="checkout-actions"><button className="button button-secondary" onClick={onBackToCart}>← Volver al carrito</button><button className="button button-primary" onClick={() => setStep(2)}>Continuar con mis datos →</button></div>
        </div>}
        {step === 2 && <form onSubmit={confirm} noValidate>
          <p className="form-intro">Usaremos estos datos solamente para simular la confirmación. No se guardan al cerrar esta pantalla.</p>
          <div className="form-grid">
            <Field label="Nombre" name="nombre" value={customer.nombre} error={errors.nombre} onChange={(v) => update('nombre', v)} autoComplete="given-name" />
            <Field label="Apellido" name="apellido" value={customer.apellido} error={errors.apellido} onChange={(v) => update('apellido', v)} autoComplete="family-name" />
            <Field label="DNI" name="dni" value={customer.dni} error={errors.dni} onChange={(v) => update('dni', v.replace(/\D/g, ''))} inputMode="numeric" />
            <Field label="Correo electrónico" name="email" type="email" value={customer.email} error={errors.email} onChange={(v) => update('email', v)} autoComplete="email" />
          </div>
          <label className={`check-field ${errors.reviewed ? 'has-error' : ''}`}><input type="checkbox" checked={customer.reviewed} onChange={(e) => update('reviewed', e.target.checked)} /><span>He revisado los productos y los datos de mi pedido.</span></label>
          {errors.reviewed && <p className="field-error" role="alert">{errors.reviewed}</p>}
          <div className="checkout-actions"><button type="button" className="button button-secondary" onClick={() => setStep(1)}>← Volver al resumen</button><button className="button button-primary" type="submit">Confirmar pedido simulado</button></div>
        </form>}
        {step === 3 && order && preview && <div className="success-step">
          <div className="success-mark">✓</div><p className="eyebrow">Código de pedido</p><h3>{order.code}</h3>
          <p>Gracias, <strong>{order.customer.nombre}</strong>. Preparamos el resumen para <strong>{order.customer.email}</strong>.</p>
          <div className="final-receipt">{order.items.map(({ product, quantity }) => <div key={product.id}><span>{formatDozens(quantity)} × {formatFullProductName(product)}<small>Precio por docena: {formatARS(product.precio)}</small></span><strong>Subtotal: {formatARS(product.precio * quantity)}</strong></div>)}<div className="receipt-total"><span>Total</span><strong>{formatARS(order.total)}</strong></div></div>
          <div className="simulation-note"><strong>Esto es una simulación</strong><p>En la versión final recibirías un correo con el resumen del pedido y las instrucciones para realizar el pago.</p></div>
          <details className="email-preview"><summary>Ver vista previa del correo simulado</summary><div><p><strong>Para:</strong> {preview.recipient}</p><p><strong>Asunto:</strong> {preview.subject}</p><pre>{preview.body}</pre></div></details>
          <button className="button button-primary button-wide" onClick={finish}>Volver al catálogo</button>
        </div>}
      </div>
    </section>
  </div>
}

interface FieldProps { label: string; name: string; value: string; error?: string; type?: string; inputMode?: 'numeric'; autoComplete?: string; onChange: (value: string) => void }
function Field({ label, name, value, error, onChange, type = 'text', ...props }: FieldProps) {
  return <div className={`field ${error ? 'has-error' : ''}`}><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} {...props} />{error && <p id={`${name}-error`} className="field-error" role="alert">{error}</p>}</div>
}
