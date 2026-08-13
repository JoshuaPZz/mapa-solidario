'use client'

import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PuntoAyuda, NuevoPunto } from '@/lib/types'
import { TIPOS_APOYO, TIPO_ICONS } from '@/lib/types'

interface AddPointModalProps {
  onClose: () => void
  onPuntoAgregado: (punto: PuntoAyuda) => void
}

interface FormState {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  tipo_apoyo: string[]
  que_recibe: string
  contacto: string
  link_inscripcion: string
  horario: string
  notas: string
  website: string // honeypot
}

const EMPTY: FormState = {
  nombre: '', direccion: '', ciudad: 'Bogotá', pais: 'Colombia',
  tipo_apoyo: [], que_recibe: '', contacto: '',
  link_inscripcion: '', horario: '', notas: '', website: '',
}

export default function AddPointModal({ onClose, onPuntoAgregado }: AddPointModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [geocodeMsg, setGeocodeMsg] = useState('')
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const lastGeoQuery = useRef('')

  const set = (key: keyof FormState, val: string | string[]) =>
    setForm((p) => ({ ...p, [key]: val }))

  const toggleTipo = (tipo: string) =>
    setForm((p) => ({
      ...p,
      tipo_apoyo: p.tipo_apoyo.includes(tipo)
        ? p.tipo_apoyo.filter((t) => t !== tipo)
        : [...p.tipo_apoyo, tipo],
    }))

  const geocodificar = useCallback(async () => {
    const query = [form.direccion, form.ciudad, form.pais].filter(Boolean).join(', ')
    if (!query.trim() || query === lastGeoQuery.current) return
    lastGeoQuery.current = query
    setGeocoding(true)
    setGeocodeStatus('idle')
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setLatLng({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        setGeocodeStatus('ok')
        setGeocodeMsg(`Ubicación encontrada: ${parseFloat(data[0].lat).toFixed(4)}, ${parseFloat(data[0].lon).toFixed(4)}`)
      } else {
        setGeocodeStatus('error')
        setGeocodeMsg('No se encontró la dirección. Intenta con más detalles.')
        setLatLng(null)
      }
    } catch {
      setGeocodeStatus('error')
      setGeocodeMsg('Error geocodificando. El punto se guardará sin coordenadas.')
    } finally {
      setGeocoding(false)
    }
  }, [form.direccion, form.ciudad, form.pais])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.website) { onClose(); return } // honeypot
    if (!form.nombre.trim() || !form.direccion.trim() || !form.ciudad.trim()) {
      setError('Completa los campos obligatorios: nombre, dirección y ciudad.')
      return
    }
    if (form.tipo_apoyo.length === 0) {
      setError('Selecciona al menos un tipo de apoyo.')
      return
    }

    setSubmitting(true)
    setError('')

    // Intento final de geocodificación si no tenemos coords
    let coords = latLng
    if (!coords && form.direccion) {
      try {
        const q = [form.direccion, form.ciudad, form.pais].join(', ')
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0)
          coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      } catch { /* continuar sin coords */ }
    }

    const payload: NuevoPunto = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      pais: form.pais.trim(),
      tipo_apoyo: form.tipo_apoyo,
      ...(form.que_recibe.trim() && { que_recibe: form.que_recibe.trim() }),
      ...(form.contacto.trim() && { contacto: form.contacto.trim() }),
      ...(form.link_inscripcion.trim() && { link_inscripcion: form.link_inscripcion.trim() }),
      ...(form.horario.trim() && { horario: form.horario.trim() }),
      ...(form.notas.trim() && { notas: form.notas.trim() }),
      ...(coords ?? {}),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase as any)
      .from('puntos_ayuda')
      .insert(payload)
      .select()
      .single()

    if (err) {
      console.error(err)
      setError('Error al publicar. Intenta de nuevo.')
      setSubmitting(false)
      return
    }

    onPuntoAgregado(data as PuntoAyuda)
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-700 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="modal-title" className="text-white font-bold text-lg">
              ＋ Agregar punto de ayuda
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Sin registro · Se publica en tiempo real para todos
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar modal"
          >✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Honeypot */}
          <input
            type="text" name="website" value={form.website}
            onChange={(e) => set('website', e.target.value)}
            tabIndex={-1} aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            autoComplete="off"
          />

          {/* Nombre */}
          <div>
            <label htmlFor="f-nombre" className="block text-slate-300 text-sm font-medium mb-1.5">
              Nombre del lugar <span className="text-red-400">*</span>
            </label>
            <input
              id="f-nombre" type="text" value={form.nombre} required maxLength={200}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="ej: Centro de acopio Parroquia San Francisco"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
            />
          </div>

          {/* Ciudad / País */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-ciudad" className="block text-slate-300 text-sm font-medium mb-1.5">
                Ciudad <span className="text-red-400">*</span>
              </label>
              <input
                id="f-ciudad" type="text" value={form.ciudad} required maxLength={100}
                onChange={(e) => set('ciudad', e.target.value)}
                placeholder="Bogotá"
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="f-pais" className="block text-slate-300 text-sm font-medium mb-1.5">
                País <span className="text-red-400">*</span>
              </label>
              <input
                id="f-pais" type="text" value={form.pais} required maxLength={100}
                onChange={(e) => set('pais', e.target.value)}
                placeholder="Colombia"
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="f-dir" className="block text-slate-300 text-sm font-medium mb-1.5">
              Dirección <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="f-dir" type="text" value={form.direccion} required maxLength={300}
                onChange={(e) => set('direccion', e.target.value)}
                onBlur={geocodificar}
                placeholder="ej: Carrera 15 #82-81"
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors pr-10"
              />
              {geocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {geocodeStatus === 'ok' && (
              <p className="text-green-400 text-xs mt-1">✓ {geocodeMsg}</p>
            )}
            {geocodeStatus === 'error' && (
              <p className="text-amber-400 text-xs mt-1">⚠ {geocodeMsg}</p>
            )}
          </div>

          {/* Tipo apoyo */}
          <div>
            <p className="text-slate-300 text-sm font-medium mb-2">
              Tipo de apoyo <span className="text-red-400">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_APOYO.map((tipo) => (
                <label
                  key={tipo}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                    form.tipo_apoyo.includes(tipo)
                      ? 'bg-red-950/50 border-red-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox" checked={form.tipo_apoyo.includes(tipo)}
                    onChange={() => toggleTipo(tipo)}
                    className="sr-only" aria-label={tipo}
                  />
                  <span className="text-base shrink-0">{TIPO_ICONS[tipo]}</span>
                  <span className="text-xs font-medium leading-tight">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Qué recibe */}
          <div>
            <label htmlFor="f-recibe" className="block text-slate-300 text-sm font-medium mb-1.5">
              ¿Qué recibe o necesita? <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="f-recibe" value={form.que_recibe} maxLength={500} rows={2}
              onChange={(e) => set('que_recibe', e.target.value)}
              placeholder="ej: agua, pañales, linternas, cobijas..."
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors resize-none"
            />
          </div>

          {/* Horario */}
          <div>
            <label htmlFor="f-horario" className="block text-slate-300 text-sm font-medium mb-1.5">
              Horario <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              id="f-horario" type="text" value={form.horario} maxLength={200}
              onChange={(e) => set('horario', e.target.value)}
              placeholder="ej: 8:00am – 6:00pm"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
            />
          </div>

          {/* Inscripción */}
          <div>
            <label htmlFor="f-inscripcion" className="block text-slate-300 text-sm font-medium mb-1.5">
              ¿Se requiere inscripción? <span className="text-slate-500 font-normal">(link o indicación)</span>
            </label>
            <input
              id="f-inscripcion" type="text" value={form.link_inscripcion} maxLength={500}
              onChange={(e) => set('link_inscripcion', e.target.value)}
              placeholder="https://forms.google.com/... o 'Por orden de llegada'"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
            />
          </div>

          {/* Contacto */}
          <div>
            <label htmlFor="f-contacto" className="block text-slate-300 text-sm font-medium mb-1.5">
              Contacto <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              id="f-contacto" type="text" value={form.contacto} maxLength={200}
              onChange={(e) => set('contacto', e.target.value)}
              placeholder="ej: 300 123 4567"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors"
            />
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="f-notas" className="block text-slate-300 text-sm font-medium mb-1.5">
              Notas adicionales <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="f-notas" value={form.notas} maxLength={500} rows={2}
              onChange={(e) => set('notas', e.target.value)}
              placeholder="Cualquier información importante..."
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500 text-sm transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-700 rounded-xl px-4 py-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed text-sm shadow-lg shadow-red-900/30"
            aria-label="Publicar punto de ayuda"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publicando...
              </span>
            ) : '🚀 Publicar — aparece al instante para todos'}
          </button>
          <p className="text-center text-slate-500 text-xs mt-2">
            Sin registro. Visible en tiempo real.
          </p>
        </div>
      </div>
    </div>
  )
}
