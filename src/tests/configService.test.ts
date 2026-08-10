import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicBusinessConfig } from '../services/configService'

const mocks = vi.hoisted(() => ({
  schema: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({ supabase: { schema: mocks.schema } }))

const row = {
  id: 1,
  nombre_negocio: 'Configuración de prueba',
  whatsapp: '+54 9 11 4000 5000',
  cbu: 'CBU-SUPABASE-TEST',
  identificacion_fiscal: 'FISCAL-SUPABASE-TEST',
  titular: 'Titular de prueba',
  horas_limite_pago: '4',
  updated_at: '2026-08-09T00:00:00Z',
}

describe('servicio de configuración pública', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset())
    mocks.schema.mockReturnValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select, insert: mocks.insert, update: mocks.update, delete: mocks.delete })
    mocks.select.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockReturnValue({ single: mocks.single })
    mocks.single.mockResolvedValue({ data: row, error: null })
  })

  it('consulta solamente configuracion_publica con id igual a 1', async () => {
    await expect(getPublicBusinessConfig()).resolves.toEqual({ ...row, horas_limite_pago: 4 })
    expect(mocks.schema).toHaveBeenCalledWith('public')
    expect(mocks.from).toHaveBeenCalledWith('configuracion_publica')
    expect(mocks.select).toHaveBeenCalledWith('id,nombre_negocio,whatsapp,cbu,identificacion_fiscal,titular,horas_limite_pago,updated_at')
    expect(mocks.eq).toHaveBeenCalledWith('id', 1)
    expect(mocks.single).toHaveBeenCalledTimes(1)
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
    expect(mocks.delete).not.toHaveBeenCalled()
  })

  it('trata una fila ausente como error y no intenta crearla', async () => {
    mocks.single.mockResolvedValue({ data: null, error: null })
    await expect(getPublicBusinessConfig()).rejects.toThrow(/configuración pública/)
    expect(mocks.insert).not.toHaveBeenCalled()
  })
})
