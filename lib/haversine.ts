/**
 * Fórmula de Haversine: distancia entre dos puntos geográficos en km.
 * No requiere PostGIS — 100% JavaScript del lado del cliente.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) {
  return deg * (Math.PI / 180)
}

export function filtrarPorRadio<T extends { lat: number | null; lng: number | null }>(
  puntos: T[],
  userLat: number,
  userLng: number,
  radioKm: number | null
): T[] {
  if (radioKm === null) return puntos
  return puntos.filter((p) => {
    if (p.lat === null || p.lng === null) return false
    return haversineKm(userLat, userLng, p.lat, p.lng) <= radioKm
  })
}
