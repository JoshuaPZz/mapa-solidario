'use client'

import type { FiltrosMapa } from '@/lib/types'
import { RADIOS } from '@/lib/types'

interface FilterBarProps {
  filtros: FiltrosMapa
  onFiltrosChange: (f: FiltrosMapa) => void
  ciudades: string[]
  realtimeConnected: boolean
  totalPuntos: number
  onAddClick: () => void
  currentView: 'list' | 'map'
  onViewChange: (view: 'list' | 'map') => void
}

export default function FilterBar({
  filtros,
  onFiltrosChange,
  ciudades,
  realtimeConnected,
  totalPuntos,
  onAddClick,
  currentView,
  onViewChange,
}: FilterBarProps) {
  const update = (partial: Partial<FiltrosMapa>) =>
    onFiltrosChange({ ...filtros, ...partial })

  return (
    <header className="bg-white border-b border-gray-200 z-[2000] relative">
      {/* Banner de emergencia */}
      <div className="bg-red-600 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-white">🆘</span>
          <span className="text-white text-xs font-bold tracking-wide uppercase">
            Emergencia Colombia — Agosto 2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              realtimeConnected ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-red-800'
            }`}
          />
          <span className="text-xs text-white/90 hidden sm:inline-block font-medium">
            {realtimeConnected ? 'En vivo' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center gap-4">
        
        {/* Toggle Vista (Lista/Mapa) y Agregar */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 shrink-0">
            <button
              onClick={() => onViewChange('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'list'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'map'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              🗺️ Mapa
            </button>
          </div>

          <button
            onClick={onAddClick}
            className="sm:hidden bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm"
          >
            ＋ Agregar
          </button>
        </div>

        {/* Filtros */}
        <div className="w-full flex-1 flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Ciudad */}
          <select
            value={filtros.ciudad}
            onChange={(e) => update({ ciudad: e.target.value })}
            className="flex-1 min-w-[140px] bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors shadow-sm"
          >
            <option value="todas">🌍 Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>📍 {c}</option>
            ))}
          </select>

          {/* Radio (solo visible si tiene ciudad o permiso, o siempre visible) */}
          <div className="hidden md:flex gap-1 shrink-0 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {RADIOS.map((r) => (
              <button
                key={r.label}
                onClick={() => update({ radio: r.value })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filtros.radio === r.value
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Estado */}
          <select
            value={filtros.estado}
            onChange={(e) => update({ estado: e.target.value as FiltrosMapa['estado'] })}
            className="w-[140px] bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors shadow-sm shrink-0"
          >
            <option value="todos">Todos los estados</option>
            <option value="necesita_apoyo">🔴 Necesita apoyo</option>
            <option value="cubierto">🟢 Cubierto</option>
          </select>

          {/* Botón agregar (Desktop) */}
          <button
            onClick={onAddClick}
            className="hidden sm:flex shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-all shadow-sm items-center gap-2"
          >
            <span className="text-lg leading-none">＋</span>
            <span>Agregar punto</span>
          </button>
        </div>
      </div>

      {/* Sub-barra de estatus */}
      <div className="px-5 pb-2 flex items-center justify-between text-xs text-gray-500">
        <span>Mostrando {totalPuntos} puntos</span>
        <span className="hidden sm:inline-block">Actualización en tiempo real vía Supabase</span>
      </div>
    </header>
  )
}
