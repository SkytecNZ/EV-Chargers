import { PlaceSearchInput } from './PlaceSearchInput'
import { useOutsideClick } from '../hooks/useOutsideClick'
import type { GeocodeResult } from '../api/geocode'
import type { RouteResult, TripPoint } from '../api/routing'

interface RoutePlannerProps {
  tripStart: TripPoint | null
  tripEnd: TripPoint | null
  onSelectStart: (result: GeocodeResult) => void
  onSelectEnd: (result: GeocodeResult) => void
  onUseMyLocation: () => void
  geoLoading: boolean
  route: RouteResult | undefined
  routeLoading: boolean
  routeError: boolean
  corridorKm: number
  onCorridorKmChange: (km: number) => void
  onClearRoute: () => void
  onClose: () => void
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function RoutePlanner({
  tripStart,
  tripEnd,
  onSelectStart,
  onSelectEnd,
  onUseMyLocation,
  geoLoading,
  route,
  routeLoading,
  routeError,
  corridorKm,
  onCorridorKmChange,
  onClearRoute,
  onClose,
}: RoutePlannerProps) {
  const ref = useOutsideClick<HTMLDivElement>(onClose)

  return (
    <div className="route-planner-panel" ref={ref}>
      <div className="route-planner__header">
        <h3>Plan your EV Trip</h3>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="route-planner__field">
        <label>Start</label>
        {tripStart ? (
          <div className="route-planner__selected">{tripStart.label}</div>
        ) : (
          <PlaceSearchInput placeholder="Start location…" onSelect={onSelectStart} />
        )}
        <button className="route-planner__location" onClick={onUseMyLocation} disabled={geoLoading}>
          {geoLoading ? 'Locating…' : '📍 Use my location'}
        </button>
      </div>

      <div className="route-planner__field">
        <label>End</label>
        {tripEnd ? (
          <div className="route-planner__selected">{tripEnd.label}</div>
        ) : (
          <PlaceSearchInput placeholder="Destination…" onSelect={onSelectEnd} />
        )}
      </div>

      <div className="route-planner__field">
        <label htmlFor="corridor-km">Show chargers within {corridorKm} km of route</label>
        <input
          id="corridor-km"
          type="range"
          min={2}
          max={10}
          step={1}
          value={corridorKm}
          onChange={(e) => onCorridorKmChange(Number(e.target.value))}
        />
      </div>

      {routeLoading && <div className="route-planner__status">Calculating route…</div>}
      {routeError && (
        <div className="route-planner__status route-planner__status--error">
          Couldn't find a driving route between those points.
        </div>
      )}
      {route && (
        <div className="route-planner__summary">
          {route.distanceKm.toFixed(0)} km · {formatDuration(route.durationMin)}
        </div>
      )}

      {(tripStart || tripEnd) && (
        <button className="route-planner__clear" onClick={onClearRoute}>
          Clear route
        </button>
      )}
    </div>
  )
}
