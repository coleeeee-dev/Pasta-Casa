import { supabase } from '../lib/supabase'
import type { PublicBusinessConfig } from '../types'

const CONFIG_COLUMNS = 'id,nombre_negocio,whatsapp,cbu,identificacion_fiscal,titular,horas_limite_pago,updated_at'

type PublicBusinessConfigRow = Record<keyof PublicBusinessConfig, unknown>

function requiredString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function mapPublicBusinessConfig(row: PublicBusinessConfigRow): PublicBusinessConfig {
  const id = Number(row.id)
  const paymentHours = Number(row.horas_limite_pago)

  if (
    id !== 1 ||
    !requiredString(row.nombre_negocio) ||
    !requiredString(row.whatsapp) ||
    !requiredString(row.cbu) ||
    !requiredString(row.identificacion_fiscal) ||
    !requiredString(row.titular) ||
    !Number.isFinite(paymentHours) ||
    paymentHours <= 0 ||
    !requiredString(row.updated_at)
  ) {
    throw new Error('La configuración pública del negocio está incompleta.')
  }

  return {
    id,
    nombre_negocio: row.nombre_negocio.trim(),
    whatsapp: row.whatsapp.trim(),
    cbu: row.cbu.trim(),
    identificacion_fiscal: row.identificacion_fiscal.trim(),
    titular: row.titular.trim(),
    horas_limite_pago: paymentHours,
    updated_at: row.updated_at,
  }
}

export async function getPublicBusinessConfig(signal?: AbortSignal): Promise<PublicBusinessConfig> {
  let query = supabase
    .schema('public')
    .from('configuracion_publica')
    .select(CONFIG_COLUMNS)
    .eq('id', 1)

  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query.single()

  if (error || !data) {
    throw new Error('No se pudo cargar la configuración pública del negocio.', { cause: error ?? undefined })
  }

  return mapPublicBusinessConfig(data as PublicBusinessConfigRow)
}
