'use client'

import { useState } from 'react'
import type { PuntoAyuda } from '@/lib/types'
import { TIPO_ICONS } from '@/lib/types'
import { fotoUrl } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import ConfirmModal from './ConfirmModal'
import ExpandableText from './ExpandableText'
import ContactDropdown from './ContactDropdown'

interface PointPopupProps {
  punto: PuntoAyuda
  onClose: () => void
  onEstadoCambiado: (estado: 'necesita_apoyo' | 'cubierto') => void
  onEditPunto?: (punto: PuntoAyuda) => void
}

export default function PointPopup({ punto, onClose, onEstadoCambiado, onEditPunto }: PointPopupProps) {
  const esNecesita = punto.estado === 'necesita_apoyo'
  const fotos = punto.fotos ?? []
  const [fotoIdx, setFotoIdx] = useState(0)
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, msg: string, action: (() => void) | null, isDestructive: boolean }>({
    isOpen: false,
    msg: '',
    action: null,
    isDestructive: false
  })
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prevFoto = () => setFotoIdx((i) => (i - 1 + fotos.length) % fotos.length)
  const nextFoto = () => setFotoIdx((i) => (i + 1) % fotos.length)

  const mapsUrl = punto.lat && punto.lng
    ? `https://www.google.com/maps?q=${punto.lat},${punto.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([punto.direccion, punto.ciudad, punto.pais].filter(Boolean).join(', '))}`

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
        {/* Carousel de fotos */}
        {fotos.length > 0 && (
          <div className="relative rounded-xl overflow-hidden bg-gray-100 -mx-4 -mt-4">
            <img
              src={fotoUrl(fotos[fotoIdx])}
              alt={`Foto ${fotoIdx + 1}`}
              className="w-full h-52 object-cover cursor-zoom-in"
              loading="lazy"
              onClick={() => setLightboxOpen(true)}
            />
            {fotos.length > 1 && (
              <>
                <button
                  onClick={prevFoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/65 text-white rounded-full text-xl font-bold flex items-center justify-center transition-colors"
                  aria-label="Foto anterior"
                >‹</button>
                <button
                  onClick={nextFoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/65 text-white rounded-full text-xl font-bold flex items-center justify-center transition-colors"
                  aria-label="Foto siguiente"
                >›</button>
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {fotoIdx + 1} / {fotos.length}
                </span>
              </>
            )}
            <span className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
              🔍 Ver detalle
            </span>
          </div>
        )}

        {/* Dirección → Google Maps (ocultado para usar botón unificado abajo si quieres, pero lo dejo aquí más sutil o lo borramos, lo borramos para no duplicar) */}

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

        {/* Ítems urgentes / necesarios */}
        {((punto.items_urgentes?.length ?? 0) > 0 || (punto.items_necesarios?.length ?? 0) > 0) && (
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">
              📦 Qué necesitan
            </p>
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        )}

        {/* Qué recibe */}
        {punto.que_recibe && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
              <span>📋</span> ¿Qué necesita?
            </h4>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <ExpandableText text={punto.que_recibe} maxLength={250} className="text-gray-700 text-sm leading-relaxed" />
            </div>
          </div>
        )}

        {/* Horario */}
        {punto.horario && (
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
            <p className="text-blue-900 text-sm font-medium">
              🕒 {punto.horario}
            </p>
          </div>
        )}

        {/* Actualizaciones en vivo */}
        {punto.notas && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-1.5">💬 Actualizaciones en vivo</p>
            <ExpandableText text={punto.notas} maxLength={250} className="text-amber-900 text-sm leading-relaxed" />
          </div>
        )}

        {/* Botones de Acción Estilizados */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Cómo llegar */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-red-100 shadow-sm"
          >
            <span>📍</span> Cómo llegar
          </a>
          
          {/* Instagram */}
          {punto.instagram && (
            <a
              href={punto.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#0A2351] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-[#113377] shadow-sm"
            >
              <span>📷</span> Instagram
            </a>
          )}

          {/* Contacto (Teléfono o Texto) */}
          {punto.contacto && <ContactDropdown contacto={punto.contacto} />}

          {/* Link Inscripción o WhatsApp */}
          {punto.link_inscripcion && (
            <a
              href={punto.link_inscripcion.startsWith('http') ? punto.link_inscripcion : '#'}
              target={punto.link_inscripcion.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 border shadow-sm px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
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

        <div className="flex items-center justify-between pt-1">
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

      {/* Lightbox */}
      {lightboxOpen && fotos.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white text-xl transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
          >✕</button>

          <div
            className="relative w-full max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotoUrl(fotos[fotoIdx])}
              alt={`Foto ${fotoIdx + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {fotos.length > 1 && (
              <>
                <button
                  onClick={prevFoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full text-2xl font-bold flex items-center justify-center transition-colors"
                  aria-label="Anterior"
                >‹</button>
                <button
                  onClick={nextFoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full text-2xl font-bold flex items-center justify-center transition-colors"
                  aria-label="Siguiente"
                >›</button>
                <p className="text-white/60 text-sm text-center mt-3 select-none">
                  {fotoIdx + 1} / {fotos.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer: cambiar estado */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
        <button
          id={`btn-estado-${punto.id}`}
          onClick={() => {
            const nuevoEstado = esNecesita ? 'cubierto' : 'necesita_apoyo';
            const confirmMsg = "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás a punto de reportar el estado de este punto.\nReportes falsos retrasan el rescate y las ayudas a quienes lo necesitan.\n\n¿Estás 100% seguro de tu reporte?";
            setConfirmConfig({
              isOpen: true,
              msg: confirmMsg,
              action: () => onEstadoCambiado(nuevoEstado),
              isDestructive: false
            })
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
