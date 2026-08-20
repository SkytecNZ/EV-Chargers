import type { Charger } from '../api/types'

// Not real public networks — a home/business owner's private charger or one
// with no operator on record at all. Not useful for trip planning, so these
// are excluded from the map entirely rather than just filterable.
const HIDDEN_OPERATORS = new Set([
  '(Business Owner at Location)',
  '(Private Residence/Individual)',
  '(Unknown Operator)',
  'Unknown operator',
])

export function isPublicNetworkCharger(charger: Charger): boolean {
  return !HIDDEN_OPERATORS.has(charger.operator)
}

// Connector types worth surfacing first in filter UIs; anything else found in
// the dataset is appended after these, alphabetically.
const COMMON_NZ_CONNECTOR_ORDER = ['Type 2 (Socket Only)', 'CCS (Type 2)', 'CHAdeMO']

// Too rare or ambiguous to be worth a filter option — hidden from the Filters
// list, but left as-is on the charger's own connector data/detail view.
const HIDDEN_CONNECTOR_TYPES = new Set(['Unknown', 'Type 2 (Tethered Connector)', 'CEE 3 Pin', 'Blue Commando (2P+E)'])

export function collectConnectorTypes(chargers: Charger[]): string[] {
  const found = new Set<string>()
  for (const charger of chargers) {
    for (const connector of charger.connectors) {
      if (!HIDDEN_CONNECTOR_TYPES.has(connector.type)) found.add(connector.type)
    }
  }

  const known = COMMON_NZ_CONNECTOR_ORDER.filter((t) => found.has(t))
  const rest = [...found].filter((t) => !known.includes(t)).sort()
  return [...known, ...rest]
}

export function collectOperators(chargers: Charger[]): string[] {
  const found = new Set(chargers.map((c) => c.operator))
  return [...found].sort()
}
