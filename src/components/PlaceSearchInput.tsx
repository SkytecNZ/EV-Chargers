import { usePlaceSearch } from '../hooks/usePlaceSearch'
import type { GeocodeResult } from '../api/geocode'

interface PlaceSearchInputProps {
  placeholder: string
  onSelect: (result: GeocodeResult) => void
  className?: string
}

export function PlaceSearchInput({ placeholder, onSelect, className }: PlaceSearchInputProps) {
  const { query, setQuery, results, loading, clear } = usePlaceSearch()

  return (
    <div className={`search-bar${className ? ` ${className}` : ''}`}>
      <input type="search" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <span className="search-bar__loading">Searching…</span>}
      {results.length > 0 && (
        <ul className="search-bar__results">
          {results.map((result, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  onSelect(result)
                  clear()
                }}
              >
                {result.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
