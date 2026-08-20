import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { MapView } from './components/MapView'
import { ChargerDetailPanel } from './components/ChargerDetailPanel'
import { FilterPanel } from './components/FilterPanel'
import { SearchBar } from './components/SearchBar'
import { GeolocateButton } from './components/GeolocateButton'
import { FavoritesPanel } from './components/FavoritesPanel'
import { RoutePlanner } from './components/RoutePlanner'
import { useChargers } from './hooks/useChargers'
import { useGeolocation, type GeoPosition } from './hooks/useGeolocation'
import { useFavorites } from './hooks/useFavorites'
import { useRoute } from './hooks/useRoute'
import { collectConnectorTypes, collectOperators } from './utils/connectors'
import { filterChargersAlongRoute } from './utils/routeCorridor'
import type { Charger } from './api/types'
import type { GeocodeResult } from './api/geocode'
import type { TripPoint } from './api/routing'

function App() {
  const { data: chargers, isLoading, isError, error } = useChargers()
  const { position: userPosition, error: geoError, loading: geoLoading, locate } = useGeolocation()
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites()

  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showRoutePlanner, setShowRoutePlanner] = useState(false)
  const [selectedConnectorTypes, setSelectedConnectorTypes] = useState<string[]>([])
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])
  const [flyToPosition, setFlyToPosition] = useState<GeoPosition | [number, number] | null>(null)

  const [tripStart, setTripStart] = useState<TripPoint | null>(null)
  const [tripEnd, setTripEnd] = useState<TripPoint | null>(null)
  const [pendingLocationForStart, setPendingLocationForStart] = useState(false)
  const [corridorKm, setCorridorKm] = useState(5)

  const connectorTypes = useMemo(() => collectConnectorTypes(chargers ?? []), [chargers])
  const operators = useMemo(() => collectOperators(chargers ?? []), [chargers])

  const filteredChargers = useMemo(() => {
    if (!chargers) return []
    return chargers.filter((charger) => {
      const matchesConnector =
        selectedConnectorTypes.length === 0 ||
        charger.connectors.some((c) => selectedConnectorTypes.includes(c.type))
      const matchesOperator = selectedOperators.length === 0 || selectedOperators.includes(charger.operator)
      return matchesConnector && matchesOperator
    })
  }, [chargers, selectedConnectorTypes, selectedOperators])

  const favoriteChargers = useMemo(
    () => (chargers ?? []).filter((c) => favoriteIds.includes(c.id)),
    [chargers, favoriteIds],
  )

  const { data: route, isLoading: routeLoading, isError: routeIsError } = useRoute(tripStart, tripEnd)

  const corridorChargers = useMemo(
    () => (route ? filterChargersAlongRoute(filteredChargers, route.geometry, corridorKm) : null),
    [route, filteredChargers, corridorKm],
  )

  const visibleChargers = corridorChargers ?? filteredChargers

  function toggleConnectorType(type: string) {
    setSelectedConnectorTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  function toggleOperator(operator: string) {
    setSelectedOperators((prev) =>
      prev.includes(operator) ? prev.filter((o) => o !== operator) : [...prev, operator],
    )
  }

  function handleLocate() {
    locate()
    setShowFavorites(false)
  }

  function handleSelectTripStart(result: GeocodeResult) {
    setTripStart({ lat: result.lat, lng: result.lng, label: result.displayName })
  }

  function handleSelectTripEnd(result: GeocodeResult) {
    setTripEnd({ lat: result.lat, lng: result.lng, label: result.displayName })
  }

  function handleUseMyLocationForStart() {
    if (userPosition) {
      setTripStart({ lat: userPosition.lat, lng: userPosition.lng, label: 'Your location' })
    } else {
      setPendingLocationForStart(true)
      locate()
    }
  }

  function handleClearRoute() {
    setTripStart(null)
    setTripEnd(null)
    setPendingLocationForStart(false)
  }

  useEffect(() => {
    if (userPosition) setFlyToPosition(userPosition)
  }, [userPosition])

  useEffect(() => {
    if (pendingLocationForStart && userPosition) {
      setTripStart({ lat: userPosition.lat, lng: userPosition.lng, label: 'Your location' })
      setPendingLocationForStart(false)
    }
  }, [pendingLocationForStart, userPosition])

  return (
    <div className="app">
      <header className="app__header">
        <h1>NZ EV Chargers</h1>
        <SearchBar onSelectPlace={(result) => setFlyToPosition([result.lat, result.lng])} />
        <div className="app__header-actions">
          <GeolocateButton onClick={handleLocate} loading={geoLoading} error={geoError} />
          <button className="app__toggle" onClick={() => setShowRoutePlanner((v) => !v)}>
            🧭 Plan your EV Trip
          </button>
          <button className="app__toggle" onClick={() => setShowFilters((v) => !v)}>
            Filters
          </button>
          <button className="app__toggle" onClick={() => setShowFavorites((v) => !v)}>
            ★ Favorites ({favoriteIds.length})
          </button>
        </div>
      </header>

      <main className="app__main">
        {isLoading && <div className="app__status">Loading NZ chargers…</div>}
        {isError && <div className="app__status app__status--error">Failed to load chargers: {String(error)}</div>}

        <MapView
          chargers={visibleChargers}
          selectedChargerId={selectedCharger?.id ?? null}
          onSelectCharger={setSelectedCharger}
          onDeselectCharger={() => setSelectedCharger(null)}
          userPosition={userPosition}
          flyToPosition={flyToPosition}
          routeGeometry={route?.geometry ?? null}
          routeStart={tripStart}
          routeEnd={tripEnd}
        />

        {showRoutePlanner && (
          <RoutePlanner
            tripStart={tripStart}
            tripEnd={tripEnd}
            onSelectStart={handleSelectTripStart}
            onSelectEnd={handleSelectTripEnd}
            onUseMyLocation={handleUseMyLocationForStart}
            geoLoading={geoLoading && pendingLocationForStart}
            route={route}
            routeLoading={routeLoading}
            routeError={routeIsError}
            corridorKm={corridorKm}
            onCorridorKmChange={setCorridorKm}
            onClearRoute={handleClearRoute}
            onClose={() => setShowRoutePlanner(false)}
          />
        )}

        {showFilters && (
          <FilterPanel
            connectorTypes={connectorTypes}
            operators={operators}
            selectedConnectorTypes={selectedConnectorTypes}
            selectedOperators={selectedOperators}
            onToggleConnectorType={toggleConnectorType}
            onToggleOperator={toggleOperator}
            onClearFilters={() => {
              setSelectedConnectorTypes([])
              setSelectedOperators([])
            }}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showFavorites && (
          <FavoritesPanel
            favorites={favoriteChargers}
            onSelectCharger={(charger) => {
              setSelectedCharger(charger)
              setFlyToPosition([charger.lat, charger.lng])
              setShowFavorites(false)
            }}
            onClose={() => setShowFavorites(false)}
          />
        )}

        {selectedCharger && (
          <ChargerDetailPanel
            charger={selectedCharger}
            isFavorite={isFavorite(selectedCharger.id)}
            onToggleFavorite={toggleFavorite}
            onClose={() => setSelectedCharger(null)}
          />
        )}
      </main>

     <footer className="app__footer">Developed by Nilantha</footer>
    </div>
  )
}

export default App
