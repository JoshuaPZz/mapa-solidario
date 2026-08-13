'use client'

import type { FiltrosMapa } from '@/lib/types'
import { RADIOS, TIPOS_APOYO } from '@/lib/types'

interface FilterBarProps {
  filtros: FiltrosMapa
  onFiltrosChange: (f: FiltrosMapa) => void
  ciudades: string[]
  realtimeConnected: boolean
  totalPuntos: number
  onAddClick: () => void
  currentView: 'list' | 'map'
  onViewChange: (view: 'list' | 'map') => void
  onInfoClick: () => void
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
  onInfoClick,
}: FilterBarProps) {
  const update = (partial: Partial<FiltrosMapa>) =>
    onFiltrosChange({ ...filtros, ...partial })

  return (
    <header className="bg-white border-b border-gray-200 z-[2000] relative">
      {/* Banner de emergencia */}
      <div className="bg-red-600 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/sos-logo.png" alt="SOS" className="w-5 h-5 animate-pulse rounded-sm shrink-0" />
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

      {/* Fila 1: toggle + búsqueda + agregar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
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

        <input
          type="text"
          placeholder="Buscar lugares, necesidades..."
          value={filtros.busqueda || ''}
          onChange={(e) => update({ busqueda: e.target.value })}
          className="flex-1 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors shadow-sm"
        />

        <button
          onClick={onAddClick}
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 sm:px-5 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
        >
          <span className="text-base leading-none">＋</span>
          <span className="hidden sm:inline">Agregar punto</span>
        </button>
      </div>

      {/* Fila 2: selectores + grupo de filtros rápidos */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        {/* Tipo de apoyo con icono */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-colors pl-2.5">
          <span className="text-sm pointer-events-none select-none shrink-0">🤝</span>
          <select
            value={filtros.tipoApoyo}
            onChange={(e) => update({ tipoApoyo: e.target.value })}
            className="py-2 pr-3 bg-transparent border-none text-gray-700 text-sm focus:outline-none cursor-pointer"
          >
            <option value="todos">Todo tipo de ayuda</option>
            {TIPOS_APOYO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Ciudad con icono */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-colors pl-2.5">
          <span className="text-sm pointer-events-none select-none shrink-0">📍</span>
          <select
            value={filtros.ciudad}
            onChange={(e) => update({ ciudad: e.target.value })}
            className="py-2 pr-3 bg-transparent border-none text-gray-700 text-sm focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Grupo secundario: distancia + estado */}
        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
          {RADIOS.map((r) => (
            <button
              key={r.label}
              onClick={() => update({ radio: r.value })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filtros.radio === r.value
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-300 mx-1 shrink-0" />
          <select
            value={filtros.estado}
            onChange={(e) => update({ estado: e.target.value as FiltrosMapa['estado'] })}
            className="bg-transparent border-none text-xs font-medium text-gray-600 focus:outline-none pr-1 cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="necesita_apoyo">Necesita apoyo</option>
            <option value="cubierto">Cubierto</option>
          </select>
        </div>
      </div>

      {/* Sub-barra de estatus */}
      <div className="px-5 pb-2 flex items-center justify-between text-xs text-gray-500">
        <span>Mostrando {totalPuntos} puntos</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block">Actualización en tiempo real vía Supabase</span>
          <button
            onClick={onInfoClick}
            className="text-gray-400 hover:text-red-600 font-medium transition-colors underline underline-offset-2"
          >
            Sobre este mapa
          </button>
        </div>
      </div>
    </header>
  )
}
