import type { Charger } from '../api/types'
import { useOutsideClick } from '../hooks/useOutsideClick'

interface FavoritesPanelProps {
  favorites: Charger[]
  onSelectCharger: (charger: Charger) => void
  onClose: () => void
}

export function FavoritesPanel({ favorites, onSelectCharger, onClose }: FavoritesPanelProps) {
  const ref = useOutsideClick<HTMLDivElement>(onClose)

  return (
    <div className="favorites-panel" ref={ref}>
      <div className="favorites-panel__header">
        <h3>Favorites</h3>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {favorites.length === 0 && <p className="favorites-panel__empty">No favorites saved yet.</p>}

      <ul>
        {favorites.map((charger) => (
          <li key={charger.id}>
            <button onClick={() => onSelectCharger(charger)}>
              <strong>{charger.name}</strong>
              <span>{charger.operator}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
