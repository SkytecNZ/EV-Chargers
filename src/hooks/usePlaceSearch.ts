import { useEffect, useState } from 'react'
import { searchNzPlace, type GeocodeResult } from '../api/geocode'

export function usePlaceSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const timeout = setTimeout(() => {
      searchNzPlace(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  function clear() {
    setQuery('')
    setResults([])
  }

  return { query, setQuery, results, loading, clear }
}
