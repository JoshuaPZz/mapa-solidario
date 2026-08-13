'use client'

import type { PuntoAyuda } from '@/lib/types'
import { TIPO_ICONS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PointPopupProps {
  punto: PuntoAyuda
  onClose: () => void
  onEstadoCambiado: (estado: 'necesita_apoyo' | 'cubierto') => void
  onEditPunto?: (punto: PuntoAyuda) => void
}

export default function PointPopup({ punto, onClose, onEstadoCambiado, onEditPunto }: PointPopupProps) {
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
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden max-h-[85vh] sm:max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className={`px-4 py-3 flex items-start justify-between gap-3 ${
        esNecesita
          ? 'bg-red-50 border-b border-red-100'
          : 'bg-green-50 border-b border-green-100'
      }`}>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1 border ${
            esNecesita
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-green-100 text-green-700 border-green-200'
          }`}>
            {esNecesita ? '🔴 Necesita apoyo' : '🟢 Cubierto'}
          </span>
          <h2 className="text-gray-900 font-bold text-base leading-tight line-clamp-2">
            {punto.nombre}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          aria-label="Cerrar panel"
        >✕</button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Dirección */}
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">📍</span>
          <div>
            <p className="text-gray-900 text-sm font-medium">{punto.direccion}</p>
            <p className="text-gray-500 text-xs">{punto.ciudad}, {punto.pais}</p>
          </div>
        </div>

        {/* Tipos de apoyo */}
        {punto.tipo_apoyo?.length > 0 && (
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">
              Tipo de apoyo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {punto.tipo_apoyo.map((tipo) => (
                <span
                  key={tipo}
                  className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1 font-medium"
                >
                  {TIPO_ICONS[tipo] || '🤝'} {tipo}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qué recibe */}
        {punto.que_recibe && (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              📋 Qué recibe / necesita
            </p>
            <p className="text-gray-800 text-sm leading-relaxed">{punto.que_recibe}</p>
          </div>
        )}

        {/* Horario */}
        {punto.horario && (
          <div className="flex items-start gap-2.5">
            <span className="text-lg shrink-0">🕐</span>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Horario</p>
              <p className="text-gray-800 text-sm">{punto.horario}</p>
            </div>
          </div>
        )}

        {/* Notas */}
        {punto.notas && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
            <p className="text-orange-800 text-sm leading-relaxed">
              <span className="font-semibold">ℹ️ </span>{punto.notas}
            </p>
          </div>
        )}

        {/* Inscripción */}
        {punto.link_inscripcion && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-1.5">
              📝 Inscripción requerida
            </p>
            {isUrl(punto.link_inscripcion) ? (
              <a
                href={punto.link_inscripcion}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 text-sm font-semibold underline break-all transition-colors"
              >
                Inscríbete aquí →
              </a>
            ) : (
              <p className="text-blue-800 text-sm">{punto.link_inscripcion}</p>
            )}
          </div>
        )}

        {/* Contacto */}
        {punto.contacto && (
          <div className="flex items-start gap-2.5">
            <span className="text-lg shrink-0">📞</span>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Contacto</p>
              <p className="text-gray-800 text-sm">{punto.contacto}</p>
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
              className="text-pink-600 hover:text-pink-500 text-sm font-semibold transition-colors underline"
            >
              Ver en Instagram →
            </a>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {onEditPunto && (
            <button
              onClick={() => {
                const confirmMsg = "ADVERTENCIA DE RESPONSABILIDAD:\n\nVas a editar información pública. Por favor, asegúrate de que la información sea verídica. Falsificar datos perjudica la ayuda.\n\n¿Deseas continuar a la edición?";
                if (window.confirm(confirmMsg)) {
                  onEditPunto(punto);
                }
              }}
              className="text-gray-500 hover:text-blue-600 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              ✏️ Editar info
            </button>
          )}
          <p className="text-gray-400 text-xs ml-auto">
            Actualizado {tiempoActualizado}
          </p>
        </div>
      </div>

      {/* Footer: cambiar estado */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
        <button
          id={`btn-estado-${punto.id}`}
          onClick={() => {
            const nuevoEstado = esNecesita ? 'cubierto' : 'necesita_apoyo';
            const confirmMsg = "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás a punto de reportar el estado de este punto.\nReportes falsos retrasan el rescate y las ayudas a quienes lo necesitan.\n\n¿Estás 100% seguro de tu reporte?";
            if (window.confirm(confirmMsg)) {
              onEstadoCambiado(nuevoEstado);
            }
          }}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border ${
            esNecesita
              ? 'bg-white text-green-700 border-green-200 hover:bg-green-50'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          aria-label={esNecesita ? 'Reportar como cubierto' : 'Reabrir punto'}
        >
          {esNecesita ? '✅ Reportar como cubierto' : '🔴 Reabrir punto'}
        </button>
      </div>
    </div>
  )
}
