import type { Charger } from '../api/types'
import type { RoutePoint } from '../api/routing'

const KM_PER_DEGREE_LAT = 111

// Uniform stride-based downsampling — simpler than true polyline simplification
// and accurate enough at a multi-km corridor width. Only used for the
// distance-filter pass, never for drawing the route itself.
export function downsampleRoute(points: RoutePoint[], maxPoints: number): RoutePoint[] {
  if (points.length <= maxPoints) return points
  const stride = Math.ceil(points.length / maxPoints)
  const sampled = points.filter((_, i) => i % stride === 0)
  const last = points[points.length - 1]
  if (sampled[sampled.length - 1] !== last) sampled.push(last)
  return sampled
}

// Equirectangular-projected point-to-segment distance, in km. Flat-earth
// approximation is fine at corridor scale (a few km).
export function distancePointToSegmentKm(p: RoutePoint, a: RoutePoint, b: RoutePoint): number {
  const midLatRad = (((a.lat + b.lat) / 2) * Math.PI) / 180
  const kmPerDegreeLng = KM_PER_DEGREE_LAT * Math.cos(midLatRad)

  const toXY = (pt: RoutePoint) => ({ x: pt.lng * kmPerDegreeLng, y: pt.lat * KM_PER_DEGREE_LAT })
  const P = toXY(p)
  const A = toXY(a)
  const B = toXY(b)

  const abx = B.x - A.x
  const aby = B.y - A.y
  const lengthSq = abx * abx + aby * aby

  let t = lengthSq === 0 ? 0 : ((P.x - A.x) * abx + (P.y - A.y) * aby) / lengthSq
  t = Math.max(0, Math.min(1, t))

  const closestX = A.x + t * abx
  const closestY = A.y + t * aby
  return Math.hypot(P.x - closestX, P.y - closestY)
}

function routeBoundsPaddedKm(points: RoutePoint[], padKm: number) {
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const midLatRad = (((minLat + maxLat) / 2) * Math.PI) / 180
  const kmPerDegreeLng = KM_PER_DEGREE_LAT * Math.cos(midLatRad)

  const latPad = padKm / KM_PER_DEGREE_LAT
  const lngPad = padKm / kmPerDegreeLng

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: Math.min(...lngs) - lngPad,
    maxLng: Math.max(...lngs) + lngPad,
  }
}

export function filterChargersAlongRoute(chargers: Charger[], routePoints: RoutePoint[], corridorKm: number): Charger[] {
  if (routePoints.length < 2) return []

  const bounds = routeBoundsPaddedKm(routePoints, corridorKm)
  const simplified = downsampleRoute(routePoints, 300)

  return chargers.filter((charger) => {
    if (
      charger.lat < bounds.minLat ||
      charger.lat > bounds.maxLat ||
      charger.lng < bounds.minLng ||
      charger.lng > bounds.maxLng
    ) {
      return false
    }

    for (let i = 1; i < simplified.length; i++) {
      if (distancePointToSegmentKm(charger, simplified[i - 1], simplified[i]) <= corridorKm) {
        return true
      }
    }
    return false
  })
}
