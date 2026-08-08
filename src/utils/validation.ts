import type { CustomerData } from '../types'
import { isValidPhone } from './phone'

export type CustomerErrors = Partial<Record<keyof CustomerData, string>>

export function validateCustomer(data: CustomerData): CustomerErrors {
  const errors: CustomerErrors = {}
  if (data.nombre.trim().length < 2) errors.nombre = 'Ingresá un nombre de al menos 2 caracteres.'
  if (data.apellido.trim().length < 2) errors.apellido = 'Ingresá un apellido de al menos 2 caracteres.'
  if (!data.telefono.trim()) errors.telefono = 'Ingresá tu número de celular.'
  else if (!isValidPhone(data.telefono)) errors.telefono = 'Ingresá un celular válido de entre 8 y 15 dígitos.'
  if (!data.metodoPago) errors.metodoPago = 'Elegí un método de pago para continuar.'
  return errors
}
