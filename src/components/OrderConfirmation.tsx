import { useState } from 'react'
import { businessConfig } from '../config/business'
import type { Order } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens, formatFullProductName } from '../utils/dozens'
import { formatOrderStatus, formatPaymentMethod } from '../utils/payment'
import { buildWhatsAppUrl, getDeliveryWhatsAppMessage, getTransferWhatsAppMessage } from '../utils/whatsapp'

interface Props { order: Order; onFinish: () => void }
type CopiedField = 'code' | 'cbu' | 'taxId'

export function OrderConfirmation({ order, onFinish }: Props) {
  const [copiedField, setCopiedField] = useState<CopiedField | null>(null)

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

    {order.metodoPago === 'transferencia'
      ? <TransferInstructions order={order} copiedField={copiedField} onCopy={copyValue} />
      : <CashOnDeliveryInstructions code={order.code} />}

    <button className="button button-primary button-wide" onClick={onFinish}>Volver al catálogo</button>
  </div>
}

interface TransferInstructionsProps { order: Order; copiedField: CopiedField | null; onCopy: (value: string, field: CopiedField) => Promise<void> }
function TransferInstructions({ order, copiedField, onCopy }: TransferInstructionsProps) {
  const transfer = businessConfig.transfer
  const whatsappUrl = buildWhatsAppUrl(getTransferWhatsAppMessage(order.code))

  return <section className="payment-instructions" aria-labelledby="transfer-instructions-title">
    <h4 id="transfer-instructions-title">Datos para realizar el pago</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Tenés {transfer.paymentWindowHours} horas para realizar la transferencia y enviar el comprobante.</p>
    <div className="payment-data-list">
      <PaymentDatum label="CBU" value={transfer.cbu} copyLabel="Copiar CBU" copied={copiedField === 'cbu'} onCopy={() => onCopy(transfer.cbu, 'cbu')} />
      <PaymentDatum label="Identificación fiscal" value={transfer.taxId} copyLabel="Copiar identificación fiscal" copied={copiedField === 'taxId'} onCopy={() => onCopy(transfer.taxId, 'taxId')} />
      <div><span>Titular</span><strong>{transfer.accountHolder}</strong></div>
      <div><span>Total a transferir</span><strong>{formatARS(order.total)}</strong></div>
      <div><span>WhatsApp para comprobantes</span><strong>{businessConfig.whatsapp.displayNumber}</strong></div>
    </div>
    <p>Una vez realizada la transferencia, enviá el comprobante por WhatsApp indicando tu código de pedido.</p>
    <a className="button button-primary button-wide" href={whatsappUrl} target="_blank" rel="noreferrer">Enviar comprobante por WhatsApp</a>
  </section>
}

interface PaymentDatumProps { label: string; value: string; copyLabel: string; copied: boolean; onCopy: () => void }
function PaymentDatum({ label, value, copyLabel, copied, onCopy }: PaymentDatumProps) {
  return <div><span>{label}</span><strong>{value}</strong><button className="text-button payment-copy-button" onClick={onCopy}>{copyLabel}</button>{copied && <small className="inline-copy-feedback" role="status">Copiado</small>}</div>
}

function CashOnDeliveryInstructions({ code }: { code: string }) {
  const whatsappUrl = buildWhatsAppUrl(getDeliveryWhatsAppMessage(code))
  return <section className="payment-instructions" aria-labelledby="delivery-instructions-title">
    <h4 id="delivery-instructions-title">Coordinación de entrega</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Para coordinar la entrega, comunicate con nosotros por WhatsApp.</p>
    <div className="coordination-checklist"><p>Para coordinar tu pedido indicá:</p><ul><li><strong>Código:</strong> {code}</li><li>Dirección de entrega</li><li>Con cuánto dinero vas a pagar</li></ul></div>
    <p className="whatsapp-message-preview">Dirección:<br />Pago con:</p>
    <a className="button button-primary button-wide" href={whatsappUrl} target="_blank" rel="noreferrer">Coordinar entrega por WhatsApp</a>
  </section>
}
