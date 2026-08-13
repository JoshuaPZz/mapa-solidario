import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy para Nominatim (OpenStreetMap).
 * Evita CORS desde el browser y agrega el User-Agent requerido.
 * Rate limit de Nominatim: 1 req/seg — respetado en el frontend.
 * Gratis, sin API key.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: 'Parámetro q requerido' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1&countrycodes=co`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MapaSolidario/1.0 (emergencia-colombia-2026)',
        'Accept-Language': 'es',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) throw new Error(`Nominatim: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Error geocodificando' }, { status: 500 })
  }
}
