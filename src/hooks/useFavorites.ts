import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ev-chargers:favorites'

function readStoredFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => readStoredFavorites())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const isFavorite = useCallback((id: number) => favoriteIds.includes(id), [favoriteIds])

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  return { favoriteIds, isFavorite, toggleFavorite }
}
