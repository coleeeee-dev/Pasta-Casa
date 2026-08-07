import { describe, expect, it, vi } from 'vitest'
import { products } from '../data/products'
import { simulateOrderEmail } from '../services/emailService'
import type { Order } from '../types'
import { generateOrderCode } from '../utils/order'
import { validateCustomer } from '../utils/validation'

describe('checkout', () => {
  it('valida un DNI incorrecto', () => { expect(validateCustomer({ nombre:'Ana',apellido:'Díaz',dni:'12A',email:'ana@mail.com',reviewed:true }).dni).toBeDefined() })
  it('valida un correo incorrecto', () => { expect(validateCustomer({ nombre:'Ana',apellido:'Díaz',dni:'12345678',email:'ana-mail',reviewed:true }).email).toBeDefined() })
  it('genera un código de pedido reproducible', () => { expect(generateOrderCode(new Date(2026,7,6),()=>0.0156)).toMatch(/^PED-20260806-[0-9A-F]{4}$/) })
  it('genera la vista previa por docenas sin solicitudes externas', () => { const fetchSpy=vi.spyOn(globalThis,'fetch'); const order:Order={ code:'PED-20260806-A3F7',customer:{nombre:'Ana',apellido:'Díaz',dni:'12345678',email:'ana@mail.com',reviewed:true},items:[{product:products[0],quantity:2}],total:products[0].precio*2,createdAt:new Date().toISOString() }; const email=simulateOrderEmail(order); expect(email.recipient).toBe('ana@mail.com'); expect(email.subject).toContain(order.code); expect(email.body).toContain('2 docenas × Sorrentinos de jamón y queso'); expect(email.body).toContain('Precio por docena:'); expect(email.body).toContain('Subtotal:'); expect(email.body).toContain('SIMULACIÓN'); expect(fetchSpy).not.toHaveBeenCalled(); fetchSpy.mockRestore() })
})
