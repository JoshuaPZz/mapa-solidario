// ============================================================
// Tipos TypeScript — Mapa Solidario
// ============================================================

export type Estado = 'necesita_apoyo' | 'cubierto'

export type TipoApoyo =
  | 'Voluntariado en sitio'
  | 'Organizar donaciones'
  | 'Entregar donaciones'
  | 'Recibe víveres'
  | 'Recibe ropa'
  | 'Recibe agua'
  | 'Personal médico'
  | 'Rescate animal'

export interface PuntoAyuda {
  id: string
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  lat: number | null
  lng: number | null
  tipo_apoyo: string[]
  items_urgentes: string[] | null
  items_necesarios: string[] | null
  que_recibe: string | null
  estado: Estado
  contacto: string | null
  link_inscripcion: string | null
  horario: string | null
  notas: string | null
  instagram: string | null
  fotos: string[] | null
  creado_en: string
  actualizado_en: string
  distanciaKm?: number
  reportes_cubierto?: number
}

export interface NuevoPunto {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  lat?: number
  lng?: number
  tipo_apoyo: string[]
  items_urgentes?: string[]
  items_necesarios?: string[]
  que_recibe?: string
  contacto?: string
  instagram?: string
  link_inscripcion?: string
  horario?: string
  notas?: string
  fotos?: string[]
}

export interface FiltrosMapa {
  busqueda: string
  ciudad: string
  radio: number | null // km, null = ver todos
  estado: Estado | 'todos'
  tipoApoyo: string | 'todos'
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      puntos_ayuda: {
        Row: PuntoAyuda
        Insert: Omit<PuntoAyuda, 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Omit<PuntoAyuda, 'id' | 'creado_en'>>
      }
    }
  }
}

export const ITEMS_AYUDA = [
  'Agua potable',
  'Alimentos',
  'Cobijas / colchonetas',
  'Generador eléctrico',
  'Medicamentos',
  'Voluntarios médicos',
  'Rescatistas',
  'Ropa',
  'Pañales',
  'Kit de higiene',
] as const

export type ItemAyuda = typeof ITEMS_AYUDA[number]

export const TIPOS_APOYO: TipoApoyo[] | string[] = [
  'Voluntariado en sitio',
  'Organizar donaciones',
  'Entregar donaciones',
  'Donar insumos',
  'Recibe víveres',
  'Recibe ropa',
  'Recibe agua',
  'Personal médico',
  'Rescate animal',
]

export const TIPO_ICONS: Record<string, string> = {
  'Voluntariado en sitio': '🙋',
  'Organizar donaciones': '📦',
  'Entregar donaciones': '🎁',
  'Donar insumos': '🛒',
  'Recibe víveres': '🥫',
  'Recibe ropa': '👕',
  'Recibe agua': '💧',
  'Personal médico': '⚕️',
  'Rescate animal': '🐾',
}

export const RADIOS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'Ver todos', value: null },
]
