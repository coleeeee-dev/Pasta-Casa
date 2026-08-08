import { describe, expect, it } from 'vitest'
import type { CustomerData, OrderStatus, PaymentMethod } from '../types'
import { normalizePhone } from '../utils/phone'
import { formatOrderStatus } from '../utils/payment'
import { validateCustomer } from '../utils/validation'

const customer = (telefono: string, metodoPago: PaymentMethod | null = 'transferencia'): CustomerData => ({ nombre: 'Ana', apellido: 'Díaz', telefono, metodoPago })

describe('checkout', () => {
  it('requiere un número de celular', () => {
    expect(validateCustomer(customer('')).telefono).toBe('Ingresá tu número de celular.')
  })

  it('rechaza un número de celular inválido', () => {
    expect(validateCustomer(customer('123-45')).telefono).toContain('entre 8 y 15 dígitos')
    expect(validateCustomer(customer('11 ABCD 5678')).telefono).toContain('entre 8 y 15 dígitos')
  })

  it.each([
    ['11 1234 5678', '1112345678'],
    ['+54 9 11 1234 5678', '5491112345678'],
    ['(011) 1234-5678', '01112345678'],
  ])('normaliza %s antes de enviarlo', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
    expect(validateCustomer(customer(input)).telefono).toBeUndefined()
  })

  it('requiere elegir un método de pago', () => {
    expect(validateCustomer(customer('11 1234 5678', null)).metodoPago).toBe('Elegí un método de pago para continuar.')
  })

  it.each<[OrderStatus, string]>([
    ['pendiente_pago', 'Pendiente de pago'],
    ['pendiente_coordinacion', 'Pendiente de coordinación'],
    ['pago_confirmado', 'Pago confirmado'],
    ['completado', 'Completado'],
    ['cancelado', 'Cancelado'],
  ])('muestra %s como %s', (status, label) => {
    expect(formatOrderStatus(status)).toBe(label)
  })
})
