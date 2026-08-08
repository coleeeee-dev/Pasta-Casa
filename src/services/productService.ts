import { supabase } from '../lib/supabase'
import type { Product } from '../types'

export interface ProductoRow {
  id: number | string
  codigo: string
  nombre: string
  descripcion: string | null
  precio: number | string
  stock_docenas: number
  imagen_url: string | null
  activo: boolean
}

const PRODUCT_COLUMNS = 'id,codigo,nombre,descripcion,precio,stock_docenas,imagen_url,activo'

export function mapProductoRow(row: ProductoRow): Product {
  const precio = Number(row.precio)
  const stock = Number(row.stock_docenas)

  if (!Number.isFinite(precio) || !Number.isFinite(stock)) {
    throw new Error(`El producto ${row.id} tiene precio o stock inválido`)
  }

  return {
    id: String(row.id),
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    presentacion: 'Presentación: 1 docena',
    precio,
    stock: Math.max(0, Math.floor(stock)),
    imagen: row.imagen_url?.trim() || null,
    activo: row.activo,
  }
}

export async function getActiveProducts(signal?: AbortSignal): Promise<Product[]> {
  let query = supabase
    .schema('public')
    .from('productos')
    .select(PRODUCT_COLUMNS)
    .eq('activo', true)
    .order('id', { ascending: true })

  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query

  if (error) {
    throw new Error('No se pudieron cargar los productos desde Supabase', { cause: error })
  }

  return ((data ?? []) as ProductoRow[]).map(mapProductoRow)
}
