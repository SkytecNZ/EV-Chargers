interface GeolocateButtonProps {
  onClick: () => void
  loading: boolean
  error: string | null
}

export function GeolocateButton({ onClick, loading, error }: GeolocateButtonProps) {
  return (
    <div className="geolocate">
      <button className="geolocate__button" onClick={onClick} disabled={loading}>
        {loading ? 'Locating…' : '📍 Near me'}
      </button>
      {error && <span className="geolocate__error">{error}</span>}
    </div>
  )
}
