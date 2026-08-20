import { mapPoiToCharger, type Charger, type OcmPoi } from './types'

const OCM_BASE_URL = 'https://api.openchargemap.io/v2/poi/'

export async function fetchNzChargers(): Promise<Charger[]> {
  const params = new URLSearchParams({
    output: 'json',
    countrycode: 'NZ',
    maxresults: '8000',
    // compact=true strips OperatorInfo/StatusType/ConnectionType down to bare
    // IDs with no Title — we need the full reference data to show them.
    compact: 'false',
    verbose: 'false',
  })

  const apiKey = import.meta.env.VITE_OCM_API_KEY as string | undefined
  if (apiKey) params.set('key', apiKey)

  const response = await fetch(`${OCM_BASE_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Open Charge Map request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as OcmPoi[]
  return data.map(mapPoiToCharger)
}
