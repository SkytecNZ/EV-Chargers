import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import type { Charger } from '../api/types'
import type { GeoPosition } from '../hooks/useGeolocation'
import type { RoutePoint } from '../api/routing'

const NZ_CENTER: [number, number] = [-41.2, 173.3]
const NZ_DEFAULT_ZOOM = 6

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  iconSize: [16, 16],
})

const routeStartIcon = L.divIcon({
  className: 'route-start-marker',
  iconSize: [18, 18],
})

const routeEndIcon = L.divIcon({
  className: 'route-end-marker',
  iconSize: [18, 18],
})

// A single charger — rendered as a bolt so it's unmistakably a charger, not a
// generic map pin. Non-operational chargers get a distinct color so they
// stand out as "don't rely on this one".
const chargerIcon = L.divIcon({
  className: 'charger-marker',
  html: '⚡',
  iconSize: [26, 26],
})

const chargerOfflineIcon = L.divIcon({
  className: 'charger-marker charger-marker--offline',
  html: '⚡',
  iconSize: [26, 26],
})

// A cluster of chargers — same bolt motif, sized by how many stations it
// groups, so it reads as "chargers here" rather than an unlabeled number.
function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 34 : count < 100 ? 44 : 54
  return L.divIcon({
    html: `<span class="charger-cluster-bolt">⚡</span><span class="charger-cluster-count">${count}</span>`,
    className: 'charger-cluster',
    iconSize: L.point(size, size, true),
  })
}

function FlyToPosition({ position }: { position: GeoPosition | [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    const target: [number, number] = Array.isArray(position) ? position : [position.lat, position.lng]
    map.flyTo(target, 12)
  }, [position, map])

  return null
}

function DeselectOnMapClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

function FitRouteBounds({ geometry }: { geometry: RoutePoint[] | null }) {
  const map = useMap()

  useEffect(() => {
    if (!geometry || geometry.length < 2) return
    const bounds = L.latLngBounds(geometry.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [geometry, map])

  return null
}

interface MapViewProps {
  chargers: Charger[]
  selectedChargerId: number | null
  onSelectCharger: (charger: Charger) => void
  onDeselectCharger: () => void
  userPosition: GeoPosition | null
  flyToPosition: GeoPosition | [number, number] | null
  routeGeometry: RoutePoint[] | null
  routeStart: RoutePoint | null
  routeEnd: RoutePoint | null
}

export function MapView({
  chargers,
  onSelectCharger,
  onDeselectCharger,
  userPosition,
  flyToPosition,
  routeGeometry,
  routeStart,
  routeEnd,
}: MapViewProps) {
  return (
    <MapContainer center={NZ_CENTER} zoom={NZ_DEFAULT_ZOOM} className="map-view">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <DeselectOnMapClick onClick={onDeselectCharger} />
      <FlyToPosition position={flyToPosition} />
      <FitRouteBounds geometry={routeGeometry} />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userLocationIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {routeGeometry && routeGeometry.length > 1 && (
        <Polyline
          positions={routeGeometry.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.75 }}
        />
      )}

      {routeStart && (
        <Marker position={[routeStart.lat, routeStart.lng]} icon={routeStartIcon}>
          <Popup>Start</Popup>
        </Marker>
      )}

      {routeEnd && (
        <Marker position={[routeEnd.lat, routeEnd.lng]} icon={routeEndIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
        {chargers.map((charger) => (
          <Marker
            key={charger.id}
            position={[charger.lat, charger.lng]}
            icon={charger.isOperational === false ? chargerOfflineIcon : chargerIcon}
            eventHandlers={{ click: () => onSelectCharger(charger) }}
          >
            <Popup>
              <strong>{charger.name}</strong>
              <br />
              {charger.operator}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
