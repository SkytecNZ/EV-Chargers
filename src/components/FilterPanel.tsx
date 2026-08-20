import { useOutsideClick } from '../hooks/useOutsideClick'

interface FilterPanelProps {
  connectorTypes: string[]
  operators: string[]
  selectedConnectorTypes: string[]
  selectedOperators: string[]
  onToggleConnectorType: (type: string) => void
  onToggleOperator: (operator: string) => void
  onClearFilters: () => void
  onClose: () => void
}

export function FilterPanel({
  connectorTypes,
  operators,
  selectedConnectorTypes,
  selectedOperators,
  onToggleConnectorType,
  onToggleOperator,
  onClearFilters,
  onClose,
}: FilterPanelProps) {
  const hasActiveFilters = selectedConnectorTypes.length > 0 || selectedOperators.length > 0
  const ref = useOutsideClick<HTMLDivElement>(onClose)

  return (
    <div className="filter-panel" ref={ref}>
      <div className="filter-panel__header">
        <h3>Filters</h3>
        <div className="filter-panel__header-actions">
          {hasActiveFilters && (
            <button className="filter-panel__clear" onClick={onClearFilters}>
              Clear
            </button>
          )}
          <button className="filter-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </div>

      <fieldset>
        <legend>Connector type</legend>
        {connectorTypes.map((type) => (
          <label key={type} className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedConnectorTypes.includes(type)}
              onChange={() => onToggleConnectorType(type)}
            />
            {type}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Network</legend>
        <div className="filter-panel__scroll">
          {operators.map((operator) => (
            <label key={operator} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedOperators.includes(operator)}
                onChange={() => onToggleOperator(operator)}
              />
              {operator}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
