import { PlaceSearchInput } from './PlaceSearchInput'
import type { GeocodeResult } from '../api/geocode'

interface SearchBarProps {
  onSelectPlace: (result: GeocodeResult) => void
}

export function SearchBar({ onSelectPlace }: SearchBarProps) {
  return <PlaceSearchInput placeholder="Search a place in New Zealand…" onSelect={onSelectPlace} />
}
