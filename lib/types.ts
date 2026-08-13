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
  que_recibe: string | null
  estado: Estado
  contacto: string | null
  link_inscripcion: string | null
  horario: string | null
  notas: string | null
  instagram: string | null
  creado_en: string
  actualizado_en: string
}

export interface NuevoPunto {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  lat?: number
  lng?: number
  tipo_apoyo: string[]
  que_recibe?: string
  contacto?: string
  link_inscripcion?: string
  horario?: string
  notas?: string
}

export interface FiltrosMapa {
  ciudad: string
  radio: number | null // km, null = ver todos
  estado: Estado | 'todos'
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

export const TIPOS_APOYO: TipoApoyo[] = [
  'Voluntariado en sitio',
  'Organizar donaciones',
  'Entregar donaciones',
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
