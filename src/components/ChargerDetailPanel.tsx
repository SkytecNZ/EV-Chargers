import type { Charger } from '../api/types'

interface ChargerDetailPanelProps {
  charger: Charger
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  onClose: () => void
}

export function ChargerDetailPanel({ charger, isFavorite, onToggleFavorite, onClose }: ChargerDetailPanelProps) {
  return (
    <div className="detail-panel">
      <button className="detail-panel__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <h2>{charger.name}</h2>
      <p className="detail-panel__address">{charger.address || 'Address unavailable'}</p>
      <p className="detail-panel__operator">{charger.operator}</p>

      <span className={`status-badge status-badge--${charger.isOperational === false ? 'down' : 'ok'}`}>
        {charger.status}
      </span>

      <h3>Connectors</h3>
      <ul className="connector-list">
        {charger.connectors.length === 0 && <li>No connector data available</li>}
        {charger.connectors.map((connector, i) => (
          <li key={i}>
            {connector.quantity}× {connector.type}
            {connector.powerKW ? ` — ${connector.powerKW} kW` : ''}
          </li>
        ))}
      </ul>

      {charger.usageCost && (
        <>
          <h3>Cost</h3>
          <p className="detail-panel__cost">{charger.usageCost}</p>
        </>
      )}

      <button className="favorite-toggle" onClick={() => onToggleFavorite(charger.id)}>
        {isFavorite ? '★ Remove favorite' : '☆ Add favorite'}
      </button>
    </div>
  )
}
