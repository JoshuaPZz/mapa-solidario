'use client'

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DraggablePinMapProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function CenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

export default function DraggablePinMap({ lat, lng, onChange }: DraggablePinMapProps) {
  const markerRef = useRef<L.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const pos = marker.getLatLng()
          onChange(pos.lat, pos.lng)
        }
      },
    }),
    [onChange]
  )

  const customIcon = L.divIcon({
    html: `<div style="font-size:28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: translate(-50%, -100%);">📍</div>`,
    className: '',
    iconSize: [0, 0]
  })

  return (
    <div className="w-full h-[180px] rounded-lg overflow-hidden border border-gray-300 relative z-[5] mt-2 mb-2">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CenterMap lat={lat} lng={lng} />
        <MapEvents onChange={onChange} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[lat, lng]}
          ref={markerRef}
          icon={customIcon}
        />
      </MapContainer>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-gray-700 shadow-sm z-[1000] pointer-events-none border border-gray-200">
        Mueve el mapa o el pin
      </div>
    </div>
  )
}
