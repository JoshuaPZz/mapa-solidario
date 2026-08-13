'use client'

import type { PuntoAyuda } from '@/lib/types'
import { TIPO_ICONS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PointCardProps {
  punto: PuntoAyuda
  onVerEnMapa?: (punto: PuntoAyuda) => void
  onCambiarEstado?: (id: string, nuevoEstado: 'necesita_apoyo' | 'cubierto') => void
}

export default function PointCard({ punto, onVerEnMapa, onCambiarEstado }: PointCardProps) {
  const isCubierto = punto.estado === 'cubierto'

  return (
    <div className={`relative flex flex-col bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${isCubierto ? 'border-green-900/50 opacity-80' : 'border-slate-800 hover:border-red-900/50'}`}>
      
      {/* Header: Title and Status Badge */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-xl font-bold text-white leading-tight">
          {punto.nombre}
        </h3>
        <div className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${isCubierto ? 'bg-green-950/50 text-green-400 border-green-800' : 'bg-red-950/50 text-red-400 border-red-800'}`}>
          {isCubierto ? '✓ Cubierto' : '⚠ Necesita apoyo'}
        </div>
      </div>

      {/* Address & Distance */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">📍</span>
          <span>{punto.direccion}, {punto.ciudad}</span>
        </div>
        {punto.distanciaKm !== undefined && (
          <div className="flex items-center gap-1.5 font-medium text-blue-400">
            <span>🚶</span>
            <span>A {punto.distanciaKm.toFixed(1)} km de ti</span>
          </div>
        )}
      </div>

      {/* Tipo de Apoyo Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {punto.tipo_apoyo.map((tipo) => (
          <span key={tipo} className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700">
            <span>{TIPO_ICONS[tipo]}</span> {tipo}
          </span>
        ))}
      </div>

      {/* Details Box */}
      <div className="bg-slate-950/50 rounded-xl p-4 mb-5 space-y-3 border border-slate-800/50">
        {punto.que_recibe && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">¿Qué necesita?</p>
            <p className="text-sm text-slate-200">{punto.que_recibe}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {punto.horario && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Horario</p>
              <p className="text-sm text-slate-300">{punto.horario}</p>
            </div>
          )}
          {punto.contacto && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Contacto</p>
              <p className="text-sm text-slate-300">{punto.contacto}</p>
            </div>
          )}
        </div>

        {punto.notas && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Notas</p>
            <p className="text-sm text-slate-400">{punto.notas}</p>
          </div>
        )}

        {/* Enlaces */}
        {(punto.instagram || punto.link_inscripcion) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {punto.instagram && (
              <a href={punto.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-xs font-medium underline underline-offset-2">
                Instagram ↗
              </a>
            )}
            {punto.link_inscripcion && (
              <a href={punto.link_inscripcion.startsWith('http') ? punto.link_inscripcion : '#'} target={punto.link_inscripcion.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-medium underline underline-offset-2">
                {punto.link_inscripcion.startsWith('http') ? 'Link inscripción ↗' : punto.link_inscripcion}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 w-full sm:w-auto text-left">
          Actualizado hace {formatDistanceToNow(new Date(punto.actualizado_en), { addSuffix: false, locale: es })}
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          {onCambiarEstado && (
            <button
              onClick={() => onCambiarEstado(punto.id, isCubierto ? 'necesita_apoyo' : 'cubierto')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                isCubierto 
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                  : 'bg-green-600/10 text-green-400 border-green-600/30 hover:bg-green-600/20'
              }`}
            >
              {isCubierto ? 'Reabrir punto' : 'Marcar como cubierto'}
            </button>
          )}

          {onVerEnMapa && punto.lat && punto.lng && (
            <button
              onClick={() => onVerEnMapa(punto)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <span>📍</span> Ver en mapa
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
