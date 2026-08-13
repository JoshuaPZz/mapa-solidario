'use client'

import type { PuntoAyuda } from '@/lib/types'
import PointCard from './PointCard'

interface FeedViewProps {
  puntos: PuntoAyuda[]
  onVerEnMapa: (punto: PuntoAyuda) => void
  onCambiarEstado: (id: string, nuevoEstado: 'necesita_apoyo' | 'cubierto') => void
  onEditPunto: (punto: PuntoAyuda) => void
}

export default function FeedView({ puntos, onVerEnMapa, onCambiarEstado, onEditPunto }: FeedViewProps) {
  if (puntos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <span className="text-4xl mb-4">🔍</span>
        <h3 className="text-lg font-semibold text-white mb-2">No se encontraron puntos</h3>
        <p className="text-center">Intenta ajustar los filtros de ciudad, radio o estado para ver más resultados.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Puntos de Ayuda <span className="text-gray-500 font-medium text-lg">({puntos.length})</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {puntos.map((punto) => (
          <PointCard
            key={punto.id}
            punto={punto}
            onVerEnMapa={onVerEnMapa}
            onCambiarEstado={onCambiarEstado}
            onEditPunto={onEditPunto}
          />
        ))}
      </div>
    </div>
  )
}
