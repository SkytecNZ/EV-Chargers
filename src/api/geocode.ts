export interface GeocodeResult {
  displayName: string
  lat: number
  lng: number
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Free-text place search restricted to New Zealand, used only to pan/zoom the
// map — it does not affect which chargers are shown.
export async function searchNzPlace(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    countrycodes: 'nz',
    format: 'jsonv2',
    limit: '5',
  })

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      // Nominatim's usage policy requires identifying the application.
      'Accept-Language': 'en-NZ',
    },
  })
  if (!response.ok) {
    throw new Error(`Place search failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>
  return data.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }))
}
