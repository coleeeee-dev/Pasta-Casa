import { useState } from 'react'
import { useBusinessConfig } from '../context/BusinessConfigContext'
import type { Order, PublicBusinessConfig } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens, formatFullProductName } from '../utils/dozens'
import { formatOrderStatus, formatPaymentMethod } from '../utils/payment'
import { buildWhatsAppUrl, getDeliveryWhatsAppMessage, getTransferWhatsAppMessage } from '../utils/whatsapp'

interface Props { order: Order; onFinish: () => void }
type CopiedField = 'code' | 'cbu'

export function OrderConfirmation({ order, onFinish }: Props) {
  const [copiedField, setCopiedField] = useState<CopiedField | null>(null)
  const { config, loading, error, refreshConfig } = useBusinessConfig()

  const copyValue = async (value: string, field: CopiedField) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
    } catch {
      setCopiedField(null)
    }
  }

  return <div className="success-step">
    <div className="success-mark">✓</div>
    <p className="eyebrow">Pedido recibido</p>
    <div className="order-code-row"><h3>{order.code}</h3><button className="button button-secondary copy-code-button" onClick={() => copyValue(order.code, 'code')}>Copiar código</button></div>
    {copiedField === 'code' && <p className="copy-feedback" role="status">Código copiado</p>}

    <div className="order-customer-summary">
      <div><span>Cliente</span><strong>{order.customer.nombre} {order.customer.apellido}</strong></div>
      <div><span>Celular</span><strong>{order.customer.telefono}</strong></div>
      <div><span>Método de pago</span><strong>{formatPaymentMethod(order.metodoPago)}</strong></div>
      <div><span>Estado</span><strong>{formatOrderStatus(order.status)}</strong></div>
    </div>

    <div className="final-receipt">
      {order.items.map(({ product, quantity }) => <div key={product.id}><span>{formatFullProductName(product)}</span><strong>{formatDozens(quantity)}</strong></div>)}
      <div className="receipt-total"><span>Total</span><strong>{formatARS(order.total)}</strong></div>
    </div>

    <p className="order-reservation-note">Los productos de tu pedido quedaron reservados.</p>

    {config && !loading
      ? order.metodoPago === 'transferencia'
        ? <TransferInstructions order={order} config={config} copiedField={copiedField} onCopy={copyValue} />
        : <CashOnDeliveryInstructions code={order.code} config={config} />
      : <ConfigUnavailable loading={loading} hasError={Boolean(error)} onRetry={refreshConfig} />}

    <button className="button button-primary button-wide" onClick={onFinish}>Volver al catálogo</button>
  </div>
}

interface TransferInstructionsProps {
  order: Order
  config: PublicBusinessConfig
  copiedField: CopiedField | null
  onCopy: (value: string, field: CopiedField) => Promise<void>
}

function TransferInstructions({ order, config, copiedField, onCopy }: TransferInstructionsProps) {
  const whatsappUrl = buildWhatsAppUrl(config.whatsapp, getTransferWhatsAppMessage(order.code))

  return <section className="payment-instructions" aria-labelledby="transfer-instructions-title">
    <h4 id="transfer-instructions-title">Datos para realizar el pago</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Tenés {config.horas_limite_pago} horas para realizar la transferencia y enviar el comprobante.</p>
    <div className="payment-data-list">
      <PaymentDatum label="CBU" value={config.cbu} copyLabel="Copiar CBU" copied={copiedField === 'cbu'} onCopy={() => onCopy(config.cbu, 'cbu')} />
      <div><span>Titular</span><strong>{config.titular}</strong></div>
      <div><span>Total a transferir</span><strong>{formatARS(order.total)}</strong></div>
      <div><span>WhatsApp para comprobantes</span><strong>{config.whatsapp}</strong></div>
    </div>
    <p>Una vez realizada la transferencia, enviá el comprobante por WhatsApp indicando tu código de pedido.</p>
    <a className="button button-primary button-wide" href={whatsappUrl} target="_blank" rel="noreferrer">Enviar comprobante por WhatsApp</a>
  </section>
}

interface PaymentDatumProps { label: string; value: string; copyLabel: string; copied: boolean; onCopy: () => void }
function PaymentDatum({ label, value, copyLabel, copied, onCopy }: PaymentDatumProps) {
  return <div><span>{label}</span><strong>{value}</strong><button className="text-button payment-copy-button" onClick={onCopy}>{copyLabel}</button>{copied && <small className="inline-copy-feedback" role="status">Copiado</small>}</div>
}

function CashOnDeliveryInstructions({ code, config }: { code: string; config: PublicBusinessConfig }) {
  const whatsappUrl = buildWhatsAppUrl(config.whatsapp, getDeliveryWhatsAppMessage(code))
  return <section className="payment-instructions" aria-labelledby="delivery-instructions-title">
    <h4 id="delivery-instructions-title">Coordinación de entrega</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Para coordinar la entrega, comunicate con nosotros por WhatsApp.</p>
    <div className="coordination-checklist"><p>Para coordinar tu pedido indicá:</p><ul><li><strong>Código:</strong> {code}</li><li>Dirección de entrega</li><li>Con cuánto dinero vas a pagar</li></ul></div>
    <a className="button button-primary button-wide" href={whatsappUrl} target="_blank" rel="noreferrer">Coordinar entrega por WhatsApp</a>
  </section>
}

function ConfigUnavailable({ loading, hasError, onRetry }: { loading: boolean; hasError: boolean; onRetry: () => Promise<void> }) {
  return <section className="payment-instructions" aria-live="polite">
    <h4>Datos del negocio</h4>
    <p>{loading ? 'Cargando los datos de pago…' : 'No pudimos cargar los datos de pago. Intentá nuevamente.'}</p>
    {!loading && hasError && <button type="button" className="button button-secondary" onClick={() => void onRetry()}>Reintentar</button>}
  </section>
}
