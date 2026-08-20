export interface RoutePoint {
  lat: number
  lng: number
}

export interface TripPoint extends RoutePoint {
  label: string
}

export interface RouteResult {
  distanceKm: number
  durationMin: number
  geometry: RoutePoint[]
}

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving'

interface OsrmResponse {
  code: string
  routes?: Array<{
    distance: number
    duration: number
    geometry: { coordinates: [number, number][] }
  }>
}

// OSRM's public demo server — free and keyless, but with no uptime SLA.
// Coordinates are lng,lat (opposite of every other lat/lng pair in this app).
export async function fetchRoute(start: RoutePoint, end: RoutePoint): Promise<RouteResult> {
  const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`
  const params = new URLSearchParams({ overview: 'full', geometries: 'geojson', steps: 'false' })

  const response = await fetch(`${OSRM_BASE_URL}/${coords}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Routing request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as OsrmResponse
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`No driving route found (${data.code})`)
  }

  const route = data.routes[0]
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    geometry: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  }
}
