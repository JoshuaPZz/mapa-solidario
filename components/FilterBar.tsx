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
}

export default function FilterBar({
  filtros,
  onFiltrosChange,
  ciudades,
  realtimeConnected,
  totalPuntos,
  onAddClick,
}: FilterBarProps) {
  const update = (partial: Partial<FiltrosMapa>) =>
    onFiltrosChange({ ...filtros, ...partial })

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 z-[2000] relative">
      {/* Banner de emergencia */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-red-300">🆘</span>
          <span className="text-white text-xs font-semibold tracking-wide uppercase">
            Emergencia Colombia — Terremoto Agosto 2026
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              realtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="text-xs text-slate-300">
            {realtimeConnected ? 'En vivo' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* Controles principales */}
      <div className="px-3 py-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-1 shrink-0">
          <span className="text-xl">🗺️</span>
          <span className="text-white font-bold text-sm hidden sm:block whitespace-nowrap">
            Mapa Solidario
          </span>
        </div>

        <div className="w-px h-6 bg-slate-700 hidden sm:block shrink-0" />

        {/* Ciudad */}
        <select
          id="filtro-ciudad"
          value={filtros.ciudad}
          onChange={(e) => update({ ciudad: e.target.value })}
          className="flex-1 min-w-0 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          aria-label="Filtrar por ciudad"
        >
          <option value="todas">🌍 Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>📍 {c}</option>
          ))}
        </select>

        {/* Radio */}
        <div className="flex gap-1 shrink-0">
          {RADIOS.map((r) => (
            <button
              key={r.label}
              onClick={() => update({ radio: r.value })}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                filtros.radio === r.value
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              aria-label={`Filtrar por radio ${r.label}`}
              aria-pressed={filtros.radio === r.value}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Estado */}
        <select
          id="filtro-estado"
          value={filtros.estado}
          onChange={(e) => update({ estado: e.target.value as FiltrosMapa['estado'] })}
          className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors shrink-0"
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos</option>
          <option value="necesita_apoyo">🔴 Necesita apoyo</option>
          <option value="cubierto">🟢 Cubierto</option>
        </select>

        {/* Botón agregar */}
        <button
          id="btn-agregar-punto"
          onClick={onAddClick}
          className="shrink-0 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
          aria-label="Agregar nuevo punto de ayuda"
        >
          <span className="text-base">＋</span>
          <span className="hidden sm:block">Agregar punto</span>
        </button>
      </div>

      {/* Sub-barra */}
      <div className="px-4 pb-1.5 flex items-center gap-3 text-xs text-slate-400">
        <span>{totalPuntos} puntos registrados</span>
        <span>·</span>
        <a
          href="https://colombiateamo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          colombiateamo.com ↗
        </a>
        <span>·</span>
        <span>Datos actualizados en tiempo real</span>
      </div>
    </header>
  )
}
