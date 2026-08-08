import { useState } from 'react'
import type { Order } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens, formatFullProductName } from '../utils/dozens'
import { formatOrderStatus, formatPaymentMethod, pendingOrderFulfillmentConfig } from '../utils/payment'

interface Props { order: Order; onFinish: () => void }

export function OrderConfirmation({ order, onFinish }: Props) {
  const [copyFeedback, setCopyFeedback] = useState('')

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.code)
      setCopyFeedback('Código copiado')
    } catch {
      setCopyFeedback('No se pudo copiar el código')
    }
  }

  return <div className="success-step">
    <div className="success-mark">✓</div>
    <p className="eyebrow">Pedido recibido</p>
    <div className="order-code-row"><h3>{order.code}</h3><button className="button button-secondary copy-code-button" onClick={copyCode}>Copiar código</button></div>
    {copyFeedback && <p className="copy-feedback" role="status">{copyFeedback}</p>}

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

    {order.metodoPago === 'transferencia'
      ? <TransferInstructions code={order.code} />
      : <CashOnDeliveryInstructions code={order.code} />}

    <button className="button button-primary button-wide" onClick={onFinish}>Volver al catálogo</button>
  </div>
}

function TransferInstructions({ code }: { code: string }) {
  const config = pendingOrderFulfillmentConfig
  return <section className="payment-instructions" aria-labelledby="transfer-instructions-title">
    <h4 id="transfer-instructions-title">Instrucciones de pago</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Tenés {config.paymentWindowHours} horas para realizar el pago y enviar el comprobante.</p>
    <div className="transfer-config-grid">
      <div className="qr-placeholder">{config.transferQrUrl ? <img src={config.transferQrUrl} alt="QR para transferencia" /> : <span>QR pendiente de configuración</span>}</div>
      <div className="transfer-data-placeholder"><div><span>Alias</span><strong>{config.transferAlias ?? 'Pendiente de configuración'}</strong></div><div><span>CBU/CVU</span><strong>{config.transferCbuCvu ?? 'Pendiente de configuración'}</strong></div></div>
    </div>
    <p className="configuration-note">Datos de transferencia próximamente configurables.</p>
    <p>Después de realizar la transferencia, enviá el comprobante por WhatsApp indicando tu código de pedido: <strong>{code}</strong>.</p>
    <WhatsAppButton label="Contactar por WhatsApp" />
  </section>
}

function CashOnDeliveryInstructions({ code }: { code: string }) {
  return <section className="payment-instructions" aria-labelledby="delivery-instructions-title">
    <h4 id="delivery-instructions-title">Coordinación de entrega</h4>
    <p><strong>Tu pedido fue registrado correctamente.</strong></p>
    <p>Para coordinar la entrega, comunicate con nosotros por WhatsApp.</p>
    <div className="coordination-checklist"><p>Para coordinar tu pedido indicá:</p><ul><li><strong>Código:</strong> {code}</li><li>Dirección de entrega</li><li>Monto con el que vas a pagar</li></ul></div>
    <WhatsAppButton label="Coordinar por WhatsApp" />
  </section>
}

function WhatsAppButton({ label }: { label: string }) {
  const url = pendingOrderFulfillmentConfig.whatsappUrl
  return url
    ? <a className="button button-primary button-wide" href={url} target="_blank" rel="noreferrer">{label}</a>
    : <><button className="button button-primary button-wide" disabled>{label}</button><p className="configuration-note">WhatsApp pendiente de configuración.</p></>
}
