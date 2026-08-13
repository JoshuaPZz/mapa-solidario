'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PuntoAyuda, NuevoPunto } from '@/lib/types'
import { TIPOS_APOYO, TIPO_ICONS } from '@/lib/types'

interface AddPointModalProps {
  onClose: () => void
  onPuntoAgregado: (punto: PuntoAyuda) => void
  initialData?: PuntoAyuda | null
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

export default function AddPointModal({ onClose, onPuntoAgregado, initialData }: AddPointModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [geocodeMsg, setGeocodeMsg] = useState('')
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const lastGeoQuery = useRef('')

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || '',
        direccion: initialData.direccion || '',
        ciudad: initialData.ciudad || '',
        pais: initialData.pais || '',
        tipo_apoyo: initialData.tipo_apoyo || [],
        que_recibe: initialData.que_recibe || '',
        contacto: initialData.contacto || '',
        link_inscripcion: initialData.link_inscripcion || '',
        horario: initialData.horario || '',
        notas: initialData.notas || '',
        website: '',
      })
      if (initialData.lat && initialData.lng) {
        setLatLng({ lat: initialData.lat, lng: initialData.lng })
        setGeocodeStatus('ok')
        setGeocodeMsg(`Ubicación existente: ${initialData.lat.toFixed(4)}, ${initialData.lng.toFixed(4)}`)
      }
    }
  }, [initialData])

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
        setGeocodeMsg('No se encontró la dirección exacta. Se guardará sin mapa.')
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

    const confirmMsg = isEditing 
      ? "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás a punto de modificar información crítica en medio de una emergencia. Esta información será vista por miles de personas que necesitan o están brindando ayuda real.\n\nFalsificar o borrar información intencionalmente perjudica los esfuerzos de rescate.\n\n¿Estás absolutamente seguro de que los datos que ingresaste son reales y verificados?"
      : "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás creando un nuevo punto de ayuda público. Esta información será visible inmediatamente para coordinar rescates y donaciones.\n\nCrear puntos falsos distrae recursos vitales y perjudica a quienes realmente lo necesitan.\n\n¿Estás seguro de que este punto es 100% real y verificado?";

    if (!window.confirm(confirmMsg)) {
      return;
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

    const payload: Partial<NuevoPunto> = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      pais: form.pais.trim(),
      tipo_apoyo: form.tipo_apoyo,
      que_recibe: form.que_recibe.trim() || null,
      contacto: form.contacto.trim() || null,
      link_inscripcion: form.link_inscripcion.trim() || null,
      horario: form.horario.trim() || null,
      notas: form.notas.trim() || null,
      ...(coords ?? {}),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let req = (supabase as any).from('puntos_ayuda')
    
    if (isEditing && initialData) {
      req = req.update(payload).eq('id', initialData.id)
    } else {
      req = req.insert(payload as NuevoPunto)
    }

    const { data, error: err } = await req.select().single()

    if (err) {
      console.error(err)
      setError(`Error al ${isEditing ? 'editar' : 'publicar'}. Intenta de nuevo.`)
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
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-gray-50">
          <div>
            <h2 id="modal-title" className="text-gray-900 font-bold text-lg">
              {isEditing ? '✏️ Editar información' : '＋ Agregar punto de ayuda'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Sin registro · Se actualiza en tiempo real
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Cerrar modal"
          >✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
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
            <label htmlFor="f-nombre" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Nombre del lugar <span className="text-red-500">*</span>
            </label>
            <input
              id="f-nombre" type="text" value={form.nombre} required maxLength={200}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="ej: Centro de acopio Parroquia San Francisco"
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
            />
          </div>

          {/* Ciudad / País */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="f-ciudad" className="block text-gray-700 text-sm font-semibold mb-1.5">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                id="f-ciudad" type="text" value={form.ciudad} required maxLength={100}
                onChange={(e) => set('ciudad', e.target.value)}
                placeholder="Bogotá"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="f-pais" className="block text-gray-700 text-sm font-semibold mb-1.5">
                País <span className="text-red-500">*</span>
              </label>
              <input
                id="f-pais" type="text" value={form.pais} required maxLength={100}
                onChange={(e) => set('pais', e.target.value)}
                placeholder="Colombia"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="f-dir" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Dirección <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="f-dir" type="text" value={form.direccion} required maxLength={300}
                onChange={(e) => set('direccion', e.target.value)}
                onBlur={geocodificar}
                placeholder="ej: Carrera 15 #82-81"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm pr-10"
              />
              {geocoding && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {geocodeStatus === 'ok' && (
              <p className="text-green-600 text-xs mt-1.5 font-medium">✓ {geocodeMsg}</p>
            )}
            {geocodeStatus === 'error' && (
              <p className="text-orange-600 text-xs mt-1.5 font-medium">⚠️ {geocodeMsg}</p>
            )}
          </div>

          {/* Tipo apoyo */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-2">
              Tipo de apoyo <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_APOYO.map((tipo) => (
                <label
                  key={tipo}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                    form.tipo_apoyo.includes(tipo)
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
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
            <label htmlFor="f-recibe" className="block text-gray-700 text-sm font-semibold mb-1.5">
              ¿Qué recibe o necesita? <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="f-recibe" value={form.que_recibe} maxLength={500} rows={2}
              onChange={(e) => set('que_recibe', e.target.value)}
              placeholder="ej: agua, pañales, linternas, cobijas..."
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors resize-none shadow-sm"
            />
          </div>

          {/* Horario */}
          <div>
            <label htmlFor="f-horario" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Horario <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="f-horario" type="text" value={form.horario} maxLength={200}
              onChange={(e) => set('horario', e.target.value)}
              placeholder="ej: 8:00am – 6:00pm"
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
            />
          </div>

          {/* Inscripción */}
          <div>
            <label htmlFor="f-inscripcion" className="block text-gray-700 text-sm font-semibold mb-1.5">
              ¿Se requiere inscripción? <span className="text-gray-400 font-normal">(link o indicación)</span>
            </label>
            <input
              id="f-inscripcion" type="text" value={form.link_inscripcion} maxLength={500}
              onChange={(e) => set('link_inscripcion', e.target.value)}
              placeholder="https://forms.google.com/... o 'Por orden de llegada'"
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
            />
          </div>

          {/* Contacto */}
          <div>
            <label htmlFor="f-contacto" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Contacto <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="f-contacto" type="text" value={form.contacto} maxLength={200}
              onChange={(e) => set('contacto', e.target.value)}
              placeholder="ej: 300 123 4567"
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
            />
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="f-notas" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Notas adicionales <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="f-notas" value={form.notas} maxLength={500} rows={2}
              onChange={(e) => set('notas', e.target.value)}
              placeholder="Cualquier información importante..."
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors resize-none shadow-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              isEditing ? '💾 Guardar Cambios' : '🚀 Publicar Punto'
            )}
          </button>
          <p className="text-center text-gray-500 text-xs mt-3">
            ⚠ Tu edición será pública inmediatamente para todos.
          </p>
        </div>
      </div>
    </div>
  )
}
