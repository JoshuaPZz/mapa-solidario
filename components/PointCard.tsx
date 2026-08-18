'use client'

import { useState } from 'react'
import type { PuntoAyuda } from '@/lib/types'
import { TIPO_ICONS } from '@/lib/types'
import { fotoUrl } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import ConfirmModal from './ConfirmModal'
import ContactDropdown from './ContactDropdown'

const QUE_RECIBE_THRESHOLD = 140
const NOTAS_THRESHOLD = 100

interface PointCardProps {
  punto: PuntoAyuda
  onVerEnMapa?: (punto: PuntoAyuda) => void
  onCambiarEstado?: (id: string, nuevoEstado: 'necesita_apoyo' | 'cubierto') => void
  onEditPunto?: (punto: PuntoAyuda) => void
  onEliminarPunto?: (id: string) => void
}

export default function PointCard({ punto, onVerEnMapa, onCambiarEstado, onEditPunto, onEliminarPunto }: PointCardProps) {
  const isCubierto = punto.estado === 'cubierto'
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, msg: string, action: (() => void) | null, isDestructive: boolean }>({
    isOpen: false,
    msg: '',
    action: null,
    isDestructive: false
  })
  const [expandedQueRecibe, setExpandedQueRecibe] = useState(false)
  const [expandedNotas, setExpandedNotas] = useState(false)
  const queRecibeLong = (punto.que_recibe?.length ?? 0) > QUE_RECIBE_THRESHOLD
  const notasLong = (punto.notas?.length ?? 0) > NOTAS_THRESHOLD

  return (
    <div className={`relative flex flex-col bg-white border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ${isCubierto ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-red-200'}`}>
      
      {/* Banner: foto real o placeholder */}
      {punto.fotos && punto.fotos.length > 0 ? (
        <div className="h-32 -mx-5 -mt-5 mb-4 relative overflow-hidden rounded-t-xl">
          <img
            src={fotoUrl(punto.fotos[0])}
            alt={punto.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {punto.fotos.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              +{punto.fotos.length - 1} fotos
            </span>
          )}
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl -mx-5 -mt-5 mb-4 border-b border-gray-200 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <span className="text-5xl opacity-40 mix-blend-multiply filter grayscale drop-shadow-sm">
            {TIPO_ICONS[punto.tipo_apoyo[0]] || '📍'}
          </span>
        </div>
      )}

      {/* Header: Title and Status Badge */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {punto.nombre}
        </h3>
        <div className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${isCubierto ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {isCubierto ? '✓ Cubierto' : '⚠ Necesita apoyo'}
        </div>
      </div>

      {/* Address & Distance */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">📍</span>
          <span>{punto.direccion}, {punto.ciudad}</span>
        </div>
        {punto.distanciaKm !== undefined && (
          <div className="flex items-center gap-1.5 font-medium text-blue-600">
            <span>🚶</span>
            <span>A {punto.distanciaKm.toFixed(1)} km de ti</span>
          </div>
        )}
      </div>

      {/* Badges de ítems urgentes/necesarios */}
      {((punto.items_urgentes?.length ?? 0) > 0 || (punto.items_necesarios?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {punto.items_urgentes?.map((item) => (
            <span key={item} className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
              🔴 {item}
            </span>
          ))}
          {punto.items_necesarios?.map((item) => (
            <span key={item} className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
              🟡 {item}
            </span>
          ))}
        </div>
      )}

      {/* Tipo de Apoyo Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {punto.tipo_apoyo.map((tipo) => (
          <span key={tipo} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200">
            <span>{TIPO_ICONS[tipo]}</span> {tipo}
          </span>
        ))}
      </div>

      {/* Details Box */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3 border border-gray-200/60">

        {/* Qué necesita */}
        {punto.que_recibe ? (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">¿Qué necesita?</p>
            <p className={`text-sm text-gray-800 break-words ${!expandedQueRecibe && queRecibeLong ? 'line-clamp-3' : ''}`}>
              {punto.que_recibe}
            </p>
            {queRecibeLong && (
              <button
                onClick={() => setExpandedQueRecibe((v) => !v)}
                className="text-xs text-red-600 hover:text-red-800 font-medium mt-1 transition-colors"
              >
                {expandedQueRecibe ? 'Ver menos ↑' : 'Ver más ↓'}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-0.5">¿Qué necesita?</p>
            <p className="text-xs text-gray-300 italic">
              Aún no hay información. Si conoces este punto, ayuda a completarla editándolo.
            </p>
          </div>
        )}

        {/* Horario */}
        {punto.horario && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Horario</p>
            <p className="text-sm text-gray-800">{punto.horario}</p>
          </div>
        )}

        {/* Notas / Actualizaciones en vivo */}
        {punto.notas && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">💬 Actualizaciones en vivo</p>
            <p className={`text-sm text-gray-600 break-words ${!expandedNotas && notasLong ? 'line-clamp-2' : ''}`}>
              {punto.notas}
            </p>
            {notasLong && (
              <button
                onClick={() => setExpandedNotas((v) => !v)}
                className="text-xs text-red-600 hover:text-red-800 font-medium mt-1 transition-colors"
              >
                {expandedNotas ? 'Ver menos ↑' : 'Ver más ↓'}
              </button>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={punto.lat && punto.lng ? `https://www.google.com/maps?q=${punto.lat},${punto.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([punto.direccion, punto.ciudad, punto.pais].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-red-100"
          >
            <span>📍</span> Cómo llegar
          </a>

          {punto.instagram && (
            <a
              href={punto.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50 hover:border-gray-300"
            >
              <span>📷</span> Instagram
            </a>
          )}

          {/* Contacto (Teléfono o Texto) */}
          {punto.contacto && <ContactDropdown contacto={punto.contacto} />}

          {punto.link_inscripcion && (
            <a
              href={punto.link_inscripcion.startsWith('http') ? punto.link_inscripcion : '#'}
              target={punto.link_inscripcion.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                punto.link_inscripcion.includes('whatsapp') || punto.link_inscripcion.includes('wa.me')
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-white text-blue-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{punto.link_inscripcion.includes('whatsapp') || punto.link_inscripcion.includes('wa.me') ? '💬' : '📝'}</span>
              {punto.link_inscripcion.includes('whatsapp') || punto.link_inscripcion.includes('wa.me')
                ? 'WhatsApp'
                : (punto.link_inscripcion.startsWith('http') ? 'Inscripción' : punto.link_inscripcion)}
            </a>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 w-full xl:w-auto text-left">
          Actualizado hace {formatDistanceToNow(new Date(punto.actualizado_en), { addSuffix: false, locale: es })}
          {punto.reportes_cubierto !== undefined && punto.reportes_cubierto > 0 && !isCubierto && (
            <span className="block mt-1 text-orange-600 font-medium">
              ⚠️ {punto.reportes_cubierto} reporte{punto.reportes_cubierto === 1 ? '' : 's'} de estar cubierto
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap w-full xl:w-auto items-center justify-start xl:justify-end gap-2">
          {onEditPunto && (
            <button
              onClick={() => {
                const confirmMsg = "ADVERTENCIA DE RESPONSABILIDAD:\n\nVas a editar información pública. Por favor, asegúrate de que la información sea verídica. Falsificar datos perjudica la ayuda.\n\n¿Deseas continuar a la edición?";
                setConfirmConfig({
                  isOpen: true,
                  msg: confirmMsg,
                  action: () => onEditPunto(punto),
                  isDestructive: false
                })
              }}
              className="flex-1 sm:flex-none px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>✏️</span> Editar info
            </button>
          )}

          {onCambiarEstado && (
            <button
              onClick={() => {
                const nuevoEstado = isCubierto ? 'necesita_apoyo' : 'cubierto';
                const confirmMsg = "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás a punto de reportar el estado de este punto.\nReportes falsos retrasan el rescate y las ayudas a quienes lo necesitan.\n\n¿Estás 100% seguro de tu reporte?";
                setConfirmConfig({
                  isOpen: true,
                  msg: confirmMsg,
                  action: () => onCambiarEstado(punto.id, nuevoEstado),
                  isDestructive: !isCubierto
                })
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                isCubierto 
                  ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                  : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
              }`}
            >
              {isCubierto ? 'Reabrir punto' : 'Reportar como cubierto'}
            </button>
          )}

          {onVerEnMapa && punto.lat && punto.lng && (
            <button
              onClick={() => onVerEnMapa(punto)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>📍</span> Ver en mapa
            </button>
          )}

          {onEliminarPunto && (
            <button
              onClick={() => setConfirmConfig({
                isOpen: true,
                msg: 'ADVERTENCIA:\n\nVas a eliminar este punto permanentemente. Esta acción no se puede deshacer y borrará toda su información y fotos.\n\n¿Estás seguro?',
                action: () => onEliminarPunto(punto.id),
                isDestructive: true,
              })}
              className="flex-1 sm:flex-none px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border border-transparent hover:border-red-100"
            >
              <span>🗑️</span> Eliminar
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        message={confirmConfig.msg}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={() => {
          if (confirmConfig.action) confirmConfig.action()
          setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        }}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
