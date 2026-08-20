// Shapes returned by the Open Charge Map /poi endpoint (compact=true).
// Only the fields this app actually uses are declared.
export interface OcmConnection {
  ConnectionType?: { Title: string } | null
  PowerKW?: number | null
  CurrentType?: { Title: string } | null
  Quantity?: number | null
}

export interface OcmPoi {
  ID: number
  AddressInfo: {
    Title: string
    AddressLine1?: string | null
    Town?: string | null
    Postcode?: string | null
    Latitude: number
    Longitude: number
  }
  OperatorInfo?: { Title: string } | null
  StatusType?: { Title: string; IsOperational: boolean | null } | null
  Connections?: OcmConnection[] | null
  NumberOfPoints?: number | null
  UsageCost?: string | null
}

// Slim domain type used throughout the app, decoupled from OCM's schema.
export interface Connector {
  type: string
  powerKW: number | null
  quantity: number
}

export interface Charger {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  operator: string
  status: string
  isOperational: boolean | null
  connectors: Connector[]
  usageCost: string | null
}

export function mapPoiToCharger(poi: OcmPoi): Charger {
  return {
    id: poi.ID,
    name: poi.AddressInfo.Title,
    address: [poi.AddressInfo.AddressLine1, poi.AddressInfo.Town, poi.AddressInfo.Postcode]
      .filter(Boolean)
      .join(', '),
    lat: poi.AddressInfo.Latitude,
    lng: poi.AddressInfo.Longitude,
    operator: poi.OperatorInfo?.Title ?? 'Unknown operator',
    status: poi.StatusType?.Title ?? 'Unknown',
    isOperational: poi.StatusType?.IsOperational ?? null,
    connectors: (poi.Connections ?? []).map((c) => ({
      type: c.ConnectionType?.Title?.trim() || 'Unknown',
      powerKW: c.PowerKW ?? null,
      quantity: c.Quantity ?? 1,
    })),
    usageCost: poi.UsageCost?.trim() || null,
  }
}
