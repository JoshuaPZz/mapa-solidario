'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { supabase, fotoUrl } from '@/lib/supabase'
import type { PuntoAyuda, NuevoPunto } from '@/lib/types'
import { TIPOS_APOYO, TIPO_ICONS, ITEMS_AYUDA } from '@/lib/types'
import { haversineKm } from '@/lib/haversine'
import ConfirmModal from './ConfirmModal'

interface AddPointModalProps {
  onClose: () => void
  onPuntoAgregado: (punto: PuntoAyuda) => void
  initialData?: PuntoAyuda | null
  puntos: PuntoAyuda[]
  onVerPunto: (punto: PuntoAyuda) => void
}

interface FormState {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  tipo_apoyo: string[]
  items_urgentes: string[]
  items_necesarios: string[]
  que_recibe: string
  contacto: string
  instagram: string
  link_inscripcion: string
  horario: string
  notas: string
  website: string // honeypot
}

const DraggablePinMap = dynamic(() => import('./DraggablePinMap'), { ssr: false })

const EMPTY: FormState = {
  nombre: '', direccion: '', ciudad: 'Bogotá', pais: 'Colombia',
  tipo_apoyo: [], items_urgentes: [], items_necesarios: [],
  que_recibe: '', contacto: '', instagram: '',
  link_inscripcion: '', horario: '', notas: '', website: '',
}

async function comprimirImagen(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_W = 1200
      const ratio = Math.min(1, MAX_W / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Compresión fallida')),
        'image/jpeg', 0.82
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export default function AddPointModal({ onClose, onPuntoAgregado, initialData, puntos, onVerPunto }: AddPointModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [geocodeMsg, setGeocodeMsg] = useState('')
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [similares, setSimilares] = useState<PuntoAyuda[]>([])
  const [similaresDismissed, setSimilaresDismissed] = useState(false)
  const [fotosFiles, setFotosFiles] = useState<File[]>([])
  const [fotosPreview, setFotosPreview] = useState<string[]>([])
  
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, msg: string, action: (() => void) | null, isDestructive: boolean }>({
    isOpen: false,
    msg: '',
    action: null,
    isDestructive: false
  })
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([])
  const [uploadingFotos, setUploadingFotos] = useState(false)
  const lastGeoQuery = useRef('')
  const prevSimilaresKey = useRef('')

  const isEditing = !!initialData

  useEffect(() => {
    return () => { fotosPreview.forEach(URL.revokeObjectURL) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || '',
        direccion: initialData.direccion || '',
        ciudad: initialData.ciudad || '',
        pais: initialData.pais || '',
        tipo_apoyo: initialData.tipo_apoyo || [],
        items_urgentes: initialData.items_urgentes || [],
        items_necesarios: initialData.items_necesarios || [],
        que_recibe: initialData.que_recibe || '',
        contacto: initialData.contacto || '',
        instagram: initialData.instagram || '',
        link_inscripcion: initialData.link_inscripcion || '',
        horario: initialData.horario || '',
        notas: initialData.notas || '',
        website: '',
      })
      setFotosExistentes(initialData.fotos || [])
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

  const toggleItem = (item: string) => {
    setForm((p) => {
      if (p.items_urgentes.includes(item)) {
        return { ...p, items_urgentes: p.items_urgentes.filter((i) => i !== item) }
      } else if (p.items_necesarios.includes(item)) {
        return {
          ...p,
          items_necesarios: p.items_necesarios.filter((i) => i !== item),
          items_urgentes: [...p.items_urgentes, item],
        }
      } else {
        return { ...p, items_necesarios: [...p.items_necesarios, item] }
      }
    })
  }

  const totalFotos = fotosExistentes.length + fotosFiles.length

  const handleFotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - totalFotos
    const valid = files
      .filter((f) => f.size <= 5 * 1024 * 1024 && f.type.startsWith('image/'))
      .slice(0, remaining)
    if (valid.length === 0) return
    setFotosFiles((prev) => [...prev, ...valid])
    const previews = valid.map((f) => URL.createObjectURL(f))
    setFotosPreview((prev) => [...prev, ...previews])
    e.target.value = ''
  }

  const removeFoto = (index: number) => {
    URL.revokeObjectURL(fotosPreview[index])
    setFotosFiles((prev) => prev.filter((_, i) => i !== index))
    setFotosPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingFoto = (index: number) => {
    setFotosExistentes((prev) => prev.filter((_, i) => i !== index))
  }

  const buscarSimilares = useCallback((coordsOverride?: { lat: number; lng: number } | null) => {
    const coords = coordsOverride !== undefined ? coordsOverride : latLng
    const normStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
    const normalizedDir = normStr(form.direccion)
    const normalizedNombre = normStr(form.nombre)
    const normalizedCiudad = form.ciudad.toLowerCase().trim()

    const found = puntos.filter((punto) => {
      if (initialData && punto.id === initialData.id) return false
      // 1. Proximidad geográfica (< 200m)
      if (coords && punto.lat && punto.lng) {
        if (haversineKm(coords.lat, coords.lng, punto.lat, punto.lng) < 0.2) return true
      }
      // 2. Misma dirección + ciudad (normalizado)
      if (
        normalizedDir.length > 5 &&
        normStr(punto.direccion) === normalizedDir &&
        punto.ciudad.toLowerCase().trim() === normalizedCiudad
      ) return true
      // 3. Nombre similar + misma ciudad
      if (
        normalizedNombre.length > 4 &&
        punto.ciudad.toLowerCase().trim() === normalizedCiudad &&
        (normStr(punto.nombre).includes(normalizedNombre) ||
          normalizedNombre.includes(normStr(punto.nombre)))
      ) return true
      return false
    })

    const newKey = found.map((p) => p.id).sort().join(',')
    if (newKey !== prevSimilaresKey.current) {
      prevSimilaresKey.current = newKey
      setSimilares(found.slice(0, 3))
      if (found.length > 0) setSimilaresDismissed(false)
    }
  }, [puntos, form.direccion, form.nombre, form.ciudad, latLng])

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
        const newCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        setLatLng(newCoords)
        setGeocodeStatus('ok')
        setGeocodeMsg(`Ubicación encontrada en mapa.`)
        buscarSimilares(newCoords)
      } else {
        setGeocodeStatus('error')
        setGeocodeMsg('No se encontró la dirección exacta. Intenta ser más específico (ej. "Carrera 15 #124-30, Bogotá").')
        setLatLng(null)
        buscarSimilares(null)
      }
    } catch {
      setGeocodeStatus('error')
      setGeocodeMsg('Error geocodificando. El punto se guardará sin coordenadas.')
    } finally {
      setGeocoding(false)
    }
  }, [form.direccion, form.ciudad, form.pais, buscarSimilares])

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
    if (similares.length > 0 && !similaresDismissed) {
      setError('Hay puntos similares arriba. Revísalos o haz clic en "Continuar de todas formas".')
      return
    }

    const confirmMsg = isEditing 
      ? "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás a punto de modificar información crítica en medio de una emergencia. Esta información será vista por miles de personas que necesitan o están brindando ayuda real.\n\nFalsificar o borrar información intencionalmente perjudica los esfuerzos de rescate.\n\n¿Estás absolutamente seguro de que los datos que ingresaste son reales y verificados?"
      : "ADVERTENCIA DE RESPONSABILIDAD:\n\nEstás creando un nuevo punto de ayuda público. Esta información será visible inmediatamente para coordinar rescates y donaciones.\n\nCrear puntos falsos distrae recursos vitales y perjudica a quienes realmente lo necesitan.\n\n¿Estás seguro de que este punto es 100% real y verificado?";

    setConfirmConfig({
      isOpen: true,
      msg: confirmMsg,
      action: () => executeSubmit(),
      isDestructive: false
    })
  }

  const executeSubmit = async () => {
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
      items_urgentes: form.items_urgentes,
      items_necesarios: form.items_necesarios,
      que_recibe: form.que_recibe.trim() || undefined,
      contacto: form.contacto.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      link_inscripcion: form.link_inscripcion.trim() || undefined,
      horario: form.horario.trim() || undefined,
      notas: form.notas.trim() || undefined,
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

    const punto = data as PuntoAyuda

    // Subir / actualizar fotos
    const fotosOriginales = initialData?.fotos ?? []
    const removidas = fotosOriginales.filter((p) => !fotosExistentes.includes(p))
    const hayFotosNuevas = fotosFiles.length > 0
    const hayFotosEliminadas = removidas.length > 0

    if (hayFotosNuevas || hayFotosEliminadas) {
      setUploadingFotos(true)

      if (hayFotosEliminadas) {
        await supabase.storage.from('fotos-de-los-lugares').remove(removidas)
      }

      const newPaths: string[] = []
      for (let i = 0; i < fotosFiles.length; i++) {
        try {
          const blob = await comprimirImagen(fotosFiles[i])
          const path = `${punto.id}/${Date.now()}_${i}.jpg`
          const { error: upErr } = await supabase.storage
            .from('fotos-de-los-lugares')
            .upload(path, blob, { contentType: 'image/jpeg' })
          if (!upErr) newPaths.push(path)
        } catch { /* continuar sin esta foto */ }
      }

      const allPaths = [...fotosExistentes, ...newPaths]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('puntos_ayuda').update({ fotos: allPaths }).eq('id', punto.id)
      punto.fotos = allPaths
      setUploadingFotos(false)
    }

    onPuntoAgregado(punto)
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
              onBlur={() => buscarSimilares()}
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
            {geocodeStatus === 'ok' && latLng && (
              <div className="mt-2">
                <p className="text-green-600 text-xs mb-1 font-medium">✓ {geocodeMsg}</p>
                <DraggablePinMap lat={latLng.lat} lng={latLng.lng} onChange={(lat, lng) => setLatLng({ lat, lng })} />
              </div>
            )}
            {geocodeStatus === 'error' && (
              <p className="text-orange-600 text-xs mt-1.5 font-medium">⚠️ {geocodeMsg}</p>
            )}
          </div>

          {/* Alerta de puntos similares */}
          {similares.length > 0 && !similaresDismissed && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-amber-900 text-sm font-semibold">
                  ⚠ Encontramos puntos similares
                </p>
                <button
                  type="button"
                  onClick={() => setSimilaresDismissed(true)}
                  className="text-amber-700 hover:text-amber-900 text-xs underline ml-3 shrink-0 transition-colors"
                >
                  Continuar de todas formas
                </button>
              </div>
              <p className="text-amber-700 text-xs mb-3">
                Verifica si ya existe uno antes de crear uno nuevo.
              </p>
              <div className="space-y-2">
                {similares.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-amber-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 text-sm font-medium truncate">{p.nombre}</p>
                      <p className="text-gray-500 text-xs truncate">{p.direccion}, {p.ciudad}</p>
                      {p.tipo_apoyo.length > 0 && (
                        <p className="text-amber-700 text-xs mt-0.5">
                          {p.tipo_apoyo.slice(0, 2).map((t) => `${TIPO_ICONS[t] ?? ''} ${t}`).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onVerPunto(p)}
                      className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Ver punto
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Ítems urgentes */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">
              ¿Qué ítems necesita? <span className="text-gray-400 font-normal">(opcional)</span>
            </p>
            <p className="text-gray-500 text-xs mb-2.5">
              1 clic = 🟡 Necesario · 2 clics = 🔴 Urgente · 3 clics = quitar
            </p>
            <div className="flex flex-wrap gap-2">
              {ITEMS_AYUDA.map((item) => {
                const esUrgente = form.items_urgentes.includes(item)
                const esNecesario = form.items_necesarios.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      esUrgente
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : esNecesario
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-gray-100 border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {esUrgente ? '🔴' : esNecesario ? '🟡' : ''} {item}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Qué recibe */}
          <div>
            <label htmlFor="f-recibe" className="block text-gray-700 text-sm font-semibold mb-1.5">
              ¿Qué recibe o necesita? <span className="text-gray-400 font-normal">(descripción libre, opcional)</span>
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

          {/* Contacto e Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="f-contacto" className="block text-gray-700 text-sm font-semibold mb-1.5">
                Contacto <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="f-contacto" type="text" value={form.contacto} maxLength={200}
                onChange={(e) => set('contacto', e.target.value)}
                placeholder="ej: 300 123 4567 | 311 987 6543"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
              />
              <p className="text-gray-400 text-xs mt-1">Para varios números, sepáralos con <code className="bg-gray-100 px-1 rounded">|</code> o coma</p>
            </div>
            
            <div>
              <label htmlFor="f-instagram" className="block text-gray-700 text-sm font-semibold mb-1.5">
                Instagram <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="f-instagram" type="text" value={form.instagram} maxLength={200}
                onChange={(e) => set('instagram', e.target.value)}
                placeholder="ej: https://instagram.com/cuenta o @cuenta"
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Notas / Actualizaciones en vivo */}
          <div>
            <label htmlFor="f-notas" className="block text-gray-700 text-sm font-semibold mb-1.5">
              Actualizaciones en vivo <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="f-notas" value={form.notas} maxLength={500} rows={3}
              onChange={(e) => set('notas', e.target.value)}
              placeholder={"Ej: 14 ago, 2pm — Quedan pocas cobijas, necesitamos más urgente. El punto cierra a las 6pm."}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm transition-colors resize-none shadow-sm"
            />
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Usa este campo como bitácora en tiempo real. Agrega tu actualización al inicio con la fecha y hora
              para que todos vean qué está pasando ahora mismo en el punto.
            </p>
          </div>

          {/* Fotos */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1.5">
              Fotos del lugar <span className="text-gray-400 font-normal">(opcional, máx. 5)</span>
            </p>

            {/* Fotos existentes (modo edición) */}
            {isEditing && fotosExistentes.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {fotosExistentes.map((path, i) => (
                  <div key={path} className="relative">
                    <img
                      src={fotoUrl(path)} alt=""
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingFoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center leading-none transition-colors"
                      aria-label="Quitar foto"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Fotos nuevas (vista previa) */}
            {fotosPreview.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {fotosPreview.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border border-blue-300 ring-1 ring-blue-400" />
                    <button
                      type="button"
                      onClick={() => removeFoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center leading-none transition-colors"
                      aria-label="Quitar foto nueva"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para agregar más */}
            {totalFotos < 5 && (
              <label className="flex flex-col items-center gap-1.5 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <span className="text-2xl">📷</span>
                <span className="text-sm text-gray-600 font-medium">
                  {totalFotos === 0 ? 'Agregar fotos' : 'Agregar más fotos'}
                </span>
                <span className="text-xs text-gray-400">Máx. 5MB por foto · jpg, png, webp · quedan {5 - totalFotos}</span>
                <input
                  type="file" accept="image/*" multiple className="sr-only"
                  onChange={handleFotoSelect}
                />
              </label>
            )}
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
                {uploadingFotos ? 'Subiendo fotos...' : 'Guardando...'}
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
