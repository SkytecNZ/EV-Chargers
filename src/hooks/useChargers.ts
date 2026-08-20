import { useQuery } from '@tanstack/react-query'
import { fetchNzChargers } from '../api/openChargeMap'
import { isPublicNetworkCharger } from '../utils/connectors'

export function useChargers() {
  return useQuery({
    queryKey: ['nz-chargers'],
    queryFn: fetchNzChargers,
    select: (chargers) => chargers.filter(isPublicNetworkCharger),
    staleTime: 1000 * 60 * 60 * 12, // 12h — charger locations rarely change
    gcTime: 1000 * 60 * 60 * 24,
  })
}
