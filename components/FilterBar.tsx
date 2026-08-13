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
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 z-[2000] relative">
      {/* Banner de emergencia */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-red-300">🆘</span>
          <span className="text-white text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Emergencia Colombia — Terremoto Agosto 2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              realtimeConnected ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-slate-500'
            }`}
          />
          <span className="text-xs text-slate-200 hidden sm:inline-block">
            {realtimeConnected ? 'En vivo' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center gap-4">
        
        {/* Toggle Vista (Lista/Mapa) y Agregar */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 shrink-0 shadow-inner">
            <button
              onClick={() => onViewChange('list')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'list'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'map'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🗺️ Mapa
            </button>
          </div>

          <button
            onClick={onAddClick}
            className="sm:hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-red-900/30"
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
            className="flex-1 min-w-[140px] bg-slate-800 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          >
            <option value="todas">🌍 Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>📍 {c}</option>
            ))}
          </select>

          {/* Radio (solo visible si tiene ciudad o permiso, o siempre visible) */}
          <div className="hidden md:flex gap-1 shrink-0 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {RADIOS.map((r) => (
              <button
                key={r.label}
                onClick={() => update({ radio: r.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filtros.radio === r.value
                    ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
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
            className="w-[140px] bg-slate-800 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors shrink-0"
          >
            <option value="todos">Todos los estados</option>
            <option value="necesita_apoyo">🔴 Necesita apoyo</option>
            <option value="cubierto">🟢 Cubierto</option>
          </select>

          {/* Botón agregar (Desktop) */}
          <button
            onClick={onAddClick}
            className="hidden sm:flex shrink-0 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] items-center gap-2"
          >
            <span className="text-lg leading-none">＋</span>
            <span>Agregar punto</span>
          </button>
        </div>
      </div>

      {/* Sub-barra de estatus */}
      <div className="px-5 pb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Mostrando {totalPuntos} puntos</span>
        <span className="hidden sm:inline-block">Actualización en tiempo real vía Supabase</span>
      </div>
    </header>
  )
}
