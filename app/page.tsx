'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PuntoAyuda, FiltrosMapa } from '@/lib/types'
import FilterBar from '@/components/FilterBar'
import AddPointModal from '@/components/AddPointModal'

import FeedView from '@/components/FeedView'
import { filtrarPorRadio } from '@/lib/haversine'

// Leaflet solo se renderiza en el cliente (no SSR)
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">Cargando mapa...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [puntos, setPuntos] = useState<PuntoAyuda[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [ciudades, setCiudades] = useState<string[]>([])
  const [filtros, setFiltros] = useState<FiltrosMapa>({
    busqueda: '',
    ciudad: 'todas',
    radio: null,
    estado: 'todos',
    tipoApoyo: 'todos',
  })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list')
  const [mapTarget, setMapTarget] = useState<PuntoAyuda | null>(null)
  const [editingPoint, setEditingPoint] = useState<PuntoAyuda | null>(null)

  // Cargar puntos iniciales
  const cargarPuntos = useCallback(async () => {
    const { data, error } = await supabase
      .from('puntos_ayuda')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('Error cargando puntos:', error)
      return
    }

    setPuntos(data as PuntoAyuda[])
    setLoading(false)
    const uniqueCiudades = [...new Set(data.map((p: PuntoAyuda) => p.ciudad).filter(Boolean))]
    setCiudades((uniqueCiudades as string[]).sort())
  }, [])

  // Geolocalización del usuario
  const obtenerUbicacion = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.info('Geolocalización no disponible, centrando en Bogotá'),
      { timeout: 8000 }
    )
  }, [])

  // Supabase Realtime — suscripción en vivo
  useEffect(() => {
    cargarPuntos()
    obtenerUbicacion()

    const channel = supabase
      .channel('puntos_ayuda_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'puntos_ayuda' },
        (payload: any) => {
          const nuevo = payload.new as PuntoAyuda
          setPuntos((prev) => [nuevo, ...prev])
          setCiudades((prev) =>
            prev.includes(nuevo.ciudad) ? prev : [...prev, nuevo.ciudad].sort()
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'puntos_ayuda' },
        (payload: any) => {
          setPuntos((prev) =>
            prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } as PuntoAyuda : p))
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'puntos_ayuda' },
        (payload: any) => {
          setPuntos((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      )
      .subscribe((status: any) => {
        setRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [cargarPuntos, obtenerUbicacion])

  const handlePuntoAgregado = (nuevo: PuntoAyuda) => {
    setPuntos((prev) => prev.find((p) => p.id === nuevo.id) ? prev : [nuevo, ...prev])
    setShowAddModal(false)
    setEditingPoint(null)
  }

  const handleEstadoCambiado = async (id: string, nuevoEstado: 'necesita_apoyo' | 'cubierto') => {
    if (nuevoEstado === 'cubierto') {
      // Usar la función segura para evitar sabotaje
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('reportar_punto_cubierto', { punto_id: id })
      if (error) console.error('Error reportando punto cubierto:', error)
      else alert('¡Reporte enviado! Gracias por avisar.')
    } else {
      // Reabrir el punto (opcional, sin protección por ahora)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('puntos_ayuda')
        .update({ estado: 'necesita_apoyo', reportes_cubierto: 0 })
        .eq('id', id)
      if (error) console.error('Error reabriendo punto:', error)
    }
  }

  const handleVerEnMapa = (punto: PuntoAyuda) => {
    setMapTarget(punto)
    setCurrentView('map')
  }

  const handleVerPuntoExistente = (punto: PuntoAyuda) => {
    setShowAddModal(false)
    handleVerEnMapa(punto)
  }

  const puntosFiltrados = useCallback(() => {
    let result = puntos

    if (filtros.estado !== 'todos') {
      result = result.filter((p) => p.estado === filtros.estado)
    }
    if (filtros.tipoApoyo !== 'todos') {
      result = result.filter((p) => p.tipo_apoyo?.includes(filtros.tipoApoyo))
    }
    if (filtros.ciudad !== 'todas') {
      result = result.filter(
        (p) => p.ciudad.toLowerCase().trim() === filtros.ciudad.toLowerCase().trim()
      )
    }
    if (filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.toLowerCase().trim()
      result = result.filter((p) => 
        p.nombre.toLowerCase().includes(q) || 
        p.direccion?.toLowerCase().includes(q) ||
        p.que_recibe?.toLowerCase().includes(q) ||
        p.notas?.toLowerCase().includes(q)
      )
    }
    if (filtros.radio !== null && userLocation) {
      result = filtrarPorRadio(result, userLocation.lat, userLocation.lng, filtros.radio)
    }

    return result
  }, [puntos, filtros, userLocation])

  const visibles = puntosFiltrados()

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      <FilterBar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        ciudades={ciudades}
        realtimeConnected={realtimeConnected}
        totalPuntos={visibles.length}
        onAddClick={() => setShowAddModal(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex-1 relative overflow-y-auto">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Cargando datos...</p>
            </div>
          </div>
        ) : currentView === 'list' ? (
          <FeedView
            puntos={visibles}
            onVerEnMapa={handleVerEnMapa}
            onCambiarEstado={handleEstadoCambiado}
            onEditPunto={setEditingPoint}
          />
        ) : (
          <MapComponent
            puntos={visibles}
            filtros={filtros}
            userLocation={userLocation}
            onEstadoCambiado={handleEstadoCambiado}
            targetPunto={mapTarget}
            onEditPunto={setEditingPoint}
          />
        )}
      </div>

      {(showAddModal || editingPoint) && (
        <AddPointModal
          onClose={() => {
            setShowAddModal(false)
            setEditingPoint(null)
          }}
          onPuntoAgregado={handlePuntoAgregado}
          initialData={editingPoint}
          puntos={puntos}
          onVerPunto={handleVerPuntoExistente}
        />
      )}
    </main>
  )
}
