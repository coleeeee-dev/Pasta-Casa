import { useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { createOrder, CreateOrderError } from '../services/orderService'
import type { CustomerData, Order, PaymentMethod } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens } from '../utils/dozens'
import { normalizePhone } from '../utils/phone'
import { validateCustomer, type CustomerErrors } from '../utils/validation'
import { CloseIcon } from './Icons'
import { OrderConfirmation } from './OrderConfirmation'

const emptyCustomer: CustomerData = { nombre: '', apellido: '', telefono: '', metodoPago: null }
interface Props { open: boolean; onClose: () => void; onBackToCart: () => void; onFinished: () => void }

export function CheckoutModal({ open, onClose, onBackToCart, onFinished }: Props) {
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [order, setOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submittingRef = useRef(false)
  if (!open) return null

  const update = <K extends keyof CustomerData>(field: K, value: CustomerData[K]) => {
    setCustomer((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submittingRef.current) return
    const nextErrors = validateCustomer(customer)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError('')
    try {
      const created = await createOrder(customer, items)
      setOrder({
        id: created.pedidoId,
        code: created.codigo,
        status: created.estado,
        metodoPago: created.metodoPago,
        customer: { ...customer, telefono: normalizePhone(customer.telefono), metodoPago: created.metodoPago },
        items: items.map((item) => ({ ...item })),
        total: created.total,
      })
      clearCart()
      setStep(3)
    } catch (error) {
      setSubmitError(error instanceof CreateOrderError ? error.message : 'No pudimos crear el pedido. Intentá nuevamente.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const finish = () => {
    setStep(1)
    setCustomer(emptyCustomer)
    setOrder(null)
    setErrors({})
    setSubmitError('')
    onFinished()
  }
  const safeClose = () => { if (submitting) return; if (step === 3) finish(); else onClose() }

  return <div className="overlay modal-overlay" role="presentation">
    <section className="checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="panel-header checkout-header">
        <div><p className="eyebrow">Compra segura</p><h2 id="checkout-title">{step === 1 ? 'Revisá tu pedido' : step === 2 ? 'Tus datos' : 'Pedido recibido'}</h2></div>
        <button className="icon-button" onClick={safeClose} aria-label="Cerrar checkout" disabled={submitting}><CloseIcon /></button>
      </div>
      <div className="progress" aria-label={`Paso ${step} de 3`}><span className={step >= 1 ? 'active' : ''}>1 <em>Resumen</em></span><i /><span className={step >= 2 ? 'active' : ''}>2 <em>Datos</em></span><i /><span className={step >= 3 ? 'active' : ''}>3 <em>Listo</em></span></div>
      <div className="checkout-content">
        {step === 1 && <div className="summary-step">
          <div className="summary-list">{items.map(({ product, quantity }) => <div className="summary-item" key={product.id}>{product.imagen ? <img src={product.imagen} alt="" /> : <div className="summary-image-placeholder" aria-hidden="true">PC</div>}<div><strong>{product.nombre}</strong><small>{formatDozens(quantity)} · {formatARS(product.precio)} por docena</small></div><span>{formatARS(product.precio * quantity)}</span></div>)}</div>
          <div className="summary-total"><span>Total del pedido</span><strong>{formatARS(total)}</strong></div>
          <div className="checkout-actions"><button className="button button-secondary" onClick={onBackToCart}>← Volver al carrito</button><button className="button button-primary" onClick={() => setStep(2)}>Continuar con mis datos →</button></div>
        </div>}
        {step === 2 && <form onSubmit={confirm} noValidate>
          <p className="form-intro">Usaremos estos datos solamente para registrar y coordinar tu pedido. No se guardan en este dispositivo.</p>
          <div className="form-grid">
            <Field label="Nombre" name="nombre" value={customer.nombre} error={errors.nombre} onChange={(value) => update('nombre', value)} autoComplete="given-name" />
            <Field label="Apellido" name="apellido" value={customer.apellido} error={errors.apellido} onChange={(value) => update('apellido', value)} autoComplete="family-name" />
            <Field label="Número de celular" name="telefono" type="tel" value={customer.telefono} error={errors.telefono} onChange={(value) => update('telefono', value)} inputMode="tel" autoComplete="tel" placeholder="Ej.: +54 9 11 1234 5678" />
          </div>
          <fieldset className={`payment-method-fieldset ${errors.metodoPago ? 'has-error' : ''}`} aria-describedby={errors.metodoPago ? 'metodo-pago-error' : undefined}>
            <legend>Método de pago</legend>
            <div className="payment-options">
              <PaymentOption method="transferencia" title="Transferencia bancaria" description="Realizá el pago dentro del plazo indicado después de registrar tu pedido." selected={customer.metodoPago === 'transferencia'} disabled={submitting} onSelect={(method) => update('metodoPago', method)} />
              <PaymentOption method="contraentrega" title="Pago contraentrega" description="Coordiná la entrega y aboná al momento de recibir tu pedido." selected={customer.metodoPago === 'contraentrega'} disabled={submitting} onSelect={(method) => update('metodoPago', method)} />
            </div>
            {errors.metodoPago && <p id="metodo-pago-error" className="field-error" role="alert">{errors.metodoPago}</p>}
          </fieldset>
          {submitError && <div className="notice error checkout-submit-error" role="alert">{submitError}</div>}
          <div className="checkout-actions"><button type="button" className="button button-secondary" onClick={() => setStep(1)} disabled={submitting}>← Volver al resumen</button><button className="button button-primary" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? 'Creando pedido…' : submitError ? 'Reintentar pedido' : 'Confirmar pedido'}</button></div>
        </form>}
        {step === 3 && order && <OrderConfirmation order={order} onFinish={finish} />}
      </div>
    </section>
  </div>
}

interface FieldProps { label: string; name: string; value: string; error?: string; type?: string; inputMode?: 'numeric' | 'tel'; autoComplete?: string; placeholder?: string; onChange: (value: string) => void }
function Field({ label, name, value, error, onChange, type = 'text', ...props }: FieldProps) {
  return <div className={`field ${error ? 'has-error' : ''}`}><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} {...props} />{error && <p id={`${name}-error`} className="field-error" role="alert">{error}</p>}</div>
}

interface PaymentOptionProps { method: PaymentMethod; title: string; description: string; selected: boolean; disabled: boolean; onSelect: (method: PaymentMethod) => void }
function PaymentOption({ method, title, description, selected, disabled, onSelect }: PaymentOptionProps) {
  return <label className={`payment-option ${selected ? 'is-selected' : ''}`}>
    <input type="radio" name="metodo-pago" value={method} checked={selected} disabled={disabled} onChange={() => onSelect(method)} />
    <span><strong>{title}</strong><small>{description}</small></span>
  </label>
}
