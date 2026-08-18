'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PuntoAyuda, FiltrosMapa } from '@/lib/types'
import { filtrarPorRadio } from '@/lib/haversine'
import PointPopup from './PointPopup'

// Fix Leaflet icon paths in Next.js/Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Iconos SVG personalizados
const createPinIcon = (color: 'red' | 'green') => {
  const fill = color === 'red' ? '#ef4444' : '#22c55e'
  const stroke = color === 'red' ? '#991b1b' : '#15803d'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="36" height="48">
    <path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="12" cy="8" r="3.5" fill="white" opacity="0.9"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  })
}

const redIcon = createPinIcon('red')
const greenIcon = createPinIcon('green')

const BOGOTA_CENTER: [number, number] = [4.6097, -74.0817]
const DEFAULT_ZOOM = 12

function CenterOnUser({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap()
  const centered = useRef(false)
  useEffect(() => {
    if (userLocation && !centered.current) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true })
      centered.current = true
    }
  }, [userLocation, map])
  return null
}

function FocusTargetPunto({ targetPunto }: { targetPunto?: PuntoAyuda | null }) {
  const map = useMap()
  useEffect(() => {
    if (targetPunto && targetPunto.lat && targetPunto.lng) {
      map.setView([targetPunto.lat, targetPunto.lng], 16, { animate: true })
    }
  }, [targetPunto, map])
  return null
}

function ZoomControls() {
  const map = useMap()
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl border border-gray-200 text-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Acercar mapa"
      >+</button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl border border-gray-200 text-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Alejar mapa"
      >−</button>
    </div>
  )
}

interface MapProps {
  puntos: PuntoAyuda[]
  filtros: FiltrosMapa
  userLocation: { lat: number; lng: number } | null
  onEstadoCambiado: (id: string, estado: 'necesita_apoyo' | 'cubierto') => void
  targetPunto?: PuntoAyuda | null
  onEditPunto: (punto: PuntoAyuda) => void
  onEliminarPunto: (id: string) => void
}

export default function Map({ puntos, filtros, userLocation, onEstadoCambiado, targetPunto, onEditPunto, onEliminarPunto }: MapProps) {
  const [selectedPunto, setSelectedPunto] = useState<PuntoAyuda | null>(null)

  useEffect(() => {
    if (targetPunto) {
      setSelectedPunto(targetPunto)
    }
  }, [targetPunto])

  const visibles = puntos.filter((p) => p.lat !== null && p.lng !== null)

  // Marcador de ubicación del usuario
  const userIcon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.4);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={BOGOTA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterOnUser userLocation={userLocation} />
        <FocusTargetPunto targetPunto={targetPunto} />
        <ZoomControls />

        {/* Ubicación del usuario */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-medium text-blue-700 text-center">📍 Tu ubicación</div>
            </Popup>
          </Marker>
        )}

        {/* Pines de puntos de ayuda */}
        {visibles.map((punto) => (
          <Marker
            key={punto.id}
            position={[punto.lat!, punto.lng!]}
            icon={punto.estado === 'necesita_apoyo' ? redIcon : greenIcon}
            eventHandlers={{ click: () => setSelectedPunto(punto) }}
          />
        ))}
      </MapContainer>

      {/* Indicador de radio */}
      {filtros.radio && (
        <div className="absolute bottom-16 left-4 z-[1000] bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-3 py-1.5 rounded-full border border-gray-200">
          Mostrando radio de {filtros.radio}km
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-3 py-2 rounded-xl border border-gray-200 space-y-1">
        <div className="font-semibold mb-1 text-gray-900">Leyenda</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span>Necesita apoyo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <span>Cubierto</span>
        </div>
      </div>

      {/* Panel lateral popup */}
      {selectedPunto && (
        <div className="absolute inset-y-0 right-0 z-[1000] w-full max-w-sm pointer-events-none">
          <div className="h-full flex items-end sm:items-center p-2 sm:p-4 pointer-events-auto">
            <PointPopup
              punto={selectedPunto}
              onClose={() => setSelectedPunto(null)}
              onEditPunto={onEditPunto}
              onEliminarPunto={(id) => { onEliminarPunto(id); setSelectedPunto(null); }}
              onEstadoCambiado={(nuevoEstado) => {
                onEstadoCambiado(selectedPunto.id, nuevoEstado)
                setSelectedPunto((prev) =>
                  prev ? { ...prev, estado: nuevoEstado } : null
                )
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
