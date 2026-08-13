'use client'

import type { PuntoAyuda } from '@/lib/types'
import { TIPO_ICONS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PointPopupProps {
  punto: PuntoAyuda
  onClose: () => void
  onEstadoCambiado: (estado: 'necesita_apoyo' | 'cubierto') => void
}

export default function PointPopup({ punto, onClose, onEstadoCambiado }: PointPopupProps) {
  const esNecesita = punto.estado === 'necesita_apoyo'

  const tiempoActualizado = (() => {
    try {
      return formatDistanceToNow(new Date(punto.actualizado_en), { addSuffix: true, locale: es })
    } catch {
      return 'recientemente'
    }
  })()

  const isUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://')

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl shadow-black/60 overflow-hidden max-h-[85vh] sm:max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className={`px-4 py-3 flex items-start justify-between gap-3 ${
        esNecesita
          ? 'bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800'
          : 'bg-gradient-to-r from-green-950 to-green-900 border-b border-green-800'
      }`}>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
            esNecesita
              ? 'bg-red-500/30 text-red-300 border border-red-500/40'
              : 'bg-green-500/30 text-green-300 border border-green-500/40'
          }`}>
            {esNecesita ? '🔴 Necesita apoyo' : '🟢 Cubierto'}
          </span>
          <h2 className="text-white font-bold text-base leading-tight line-clamp-2">
            {punto.nombre}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Cerrar panel"
        >✕</button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Dirección */}
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">📍</span>
          <div>
            <p className="text-white text-sm font-medium">{punto.direccion}</p>
            <p className="text-slate-400 text-xs">{punto.ciudad}, {punto.pais}</p>
          </div>
        </div>

        {/* Tipos de apoyo */}
        {punto.tipo_apoyo?.length > 0 && (
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
              Tipo de apoyo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {punto.tipo_apoyo.map((tipo) => (
                <span
                  key={tipo}
                  className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1"
                >
                  {TIPO_ICONS[tipo] || '🤝'} {tipo}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qué recibe */}
        {punto.que_recibe && (
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
              📋 Qué recibe / necesita
            </p>
            <p className="text-slate-200 text-sm leading-relaxed">{punto.que_recibe}</p>
          </div>
        )}

        {/* Horario */}
        {punto.horario && (
          <div className="flex items-start gap-2.5">
            <span className="text-lg shrink-0">🕐</span>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Horario</p>
              <p className="text-slate-200 text-sm">{punto.horario}</p>
            </div>
          </div>
        )}

        {/* Notas */}
        {punto.notas && (
          <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3">
            <p className="text-amber-200 text-sm leading-relaxed">
              <span className="font-semibold">ℹ️ </span>{punto.notas}
            </p>
          </div>
        )}

        {/* Inscripción */}
        {punto.link_inscripcion && (
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1.5">
              📝 Inscripción requerida
            </p>
            {isUrl(punto.link_inscripcion) ? (
              <a
                href={punto.link_inscripcion}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline break-all transition-colors"
              >
                Inscríbete aquí →
              </a>
            ) : (
              <p className="text-blue-200 text-sm">{punto.link_inscripcion}</p>
            )}
          </div>
        )}

        {/* Contacto */}
        {punto.contacto && (
          <div className="flex items-start gap-2.5">
            <span className="text-lg shrink-0">📞</span>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Contacto</p>
              <p className="text-slate-200 text-sm">{punto.contacto}</p>
            </div>
          </div>
        )}

        {/* Instagram */}
        {punto.instagram && (
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📱</span>
            <a
              href={punto.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
            >
              Ver en Instagram →
            </a>
          </div>
        )}

        <p className="text-slate-500 text-xs text-right pt-1">
          Actualizado {tiempoActualizado}
        </p>
      </div>

      {/* Footer: cambiar estado */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          id={`btn-estado-${punto.id}`}
          onClick={() => onEstadoCambiado(esNecesita ? 'cubierto' : 'necesita_apoyo')}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
            esNecesita
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          aria-label={esNecesita ? 'Marcar como cubierto' : 'Marcar que necesita apoyo'}
        >
          {esNecesita ? '✅ Marcar como cubierto' : '🔴 Marcar que necesita apoyo'}
        </button>
        <p className="text-center text-slate-500 text-xs mt-1.5">
          Cambio visible para todos en tiempo real
        </p>
      </div>
    </div>
  )
}
