import { useQuery } from '@tanstack/react-query'
import { fetchRoute, type RoutePoint } from '../api/routing'

function round(n: number) {
  return Math.round(n * 10000) / 10000
}

export function useRoute(start: RoutePoint | null, end: RoutePoint | null) {
  return useQuery({
    queryKey: start && end ? ['route', round(start.lat), round(start.lng), round(end.lat), round(end.lng)] : ['route'],
    queryFn: () => fetchRoute(start!, end!),
    enabled: !!start && !!end,
    staleTime: Infinity, // the route between two fixed points never changes
    retry: false,
  })
}
