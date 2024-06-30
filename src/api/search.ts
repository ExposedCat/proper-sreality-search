import { shortDate } from '../shared/date.js'
import { API_ENDPOINT, httpCall } from '../shared/http.js'
import type { FilterDate } from './filters.js'
import {
  FILTER_BUILDING_TYPE,
  FILTER_BUILDING_TYPE_ID,
  FILTER_CONDITION,
  FILTER_CONDITION_ID,
  FILTER_DATE,
  FILTER_DISTRICT,
  FILTER_DISTRICT_ID,
  FILTER_ENERGY_EFFICIENCY,
  FILTER_ENERGY_EFFICIENCY_ID,
  FILTER_EXTRA_1,
  FILTER_EXTRA_1_ID,
  FILTER_EXTRA_2,
  FILTER_EXTRA_2_ID,
  FILTER_EXTRA_3,
  FILTER_EXTRA_3_ID,
  FILTER_FURNISHED,
  FILTER_FURNISHED_ID,
  FILTER_PRICE,
  FILTER_REGION,
  FILTER_REGION_ID,
  FILTER_TYPE,
  FILTER_TYPE_ID,
  type FilterOptions
} from './filters.js'
import type { SearchResponse } from './response.js'

const SEARCH_PATH = '/cs/v2/estates'

export type EstatePreview = {
  url: string
  isAuction: boolean
}

function createSearchUrl(params: FilterOptions) {
  const url = new URL(`${API_ENDPOINT}${SEARCH_PATH}`)

  const filters: [
    string,
    Record<string, unknown>,
    FilterOptions[keyof Omit<FilterOptions, 'dates' | 'prices'>]
  ][] = [
    [FILTER_TYPE, FILTER_TYPE_ID, params.types],
    [FILTER_REGION, FILTER_REGION_ID, params.regions],
    [FILTER_CONDITION, FILTER_CONDITION_ID, params.conditions],
    [FILTER_DISTRICT, FILTER_DISTRICT_ID, params.districts],
    [FILTER_BUILDING_TYPE, FILTER_BUILDING_TYPE_ID, params.buildingTypes],
    [
      FILTER_ENERGY_EFFICIENCY,
      FILTER_ENERGY_EFFICIENCY_ID,
      params.energyEfficiencies
    ],
    [FILTER_FURNISHED, FILTER_FURNISHED_ID, params.furnished],
    [FILTER_EXTRA_1, FILTER_EXTRA_1_ID, params.extras1],
    [FILTER_EXTRA_2, FILTER_EXTRA_2_ID, params.extras2],
    [FILTER_EXTRA_3, FILTER_EXTRA_3_ID, params.extras3]
  ]

  for (const [param, ids, value] of filters) {
    if (value) {
      url.searchParams.append(param, value.map(type => ids[type]).join('|'))
    }
  }

  if (params.dates) {
    const fromDate =
      'from' in params.dates && params.dates.from
        ? shortDate(params.dates.from)
        : ''
    const toDate =
      'to' in params.dates && params.dates.to ? shortDate(params.dates.to) : ''

    const value =
      'now' in params.dates ? 'now' : (`${fromDate}|${toDate}` as FilterDate)
    url.searchParams.append(FILTER_DATE, value)
  }

  if (params.prices) {
    url.searchParams.append(
      FILTER_PRICE,
      `${params.prices.from ?? 0}|${params.prices.to ?? 10000000000}`
    )
  }

  return url
}

export async function searchEstates(
  params: FilterOptions
): Promise<EstatePreview[]> {
  const response = await httpCall<SearchResponse>({
    url: createSearchUrl(params)
  })
  if (!response.ok) {
    console.log({ error: response.error }, 'Search request failed')
    process.exit(1)
  }

  return response.data._embedded.estates.map(estate => ({
    url: estate._links.self.href,
    isAuction: estate.is_auction
  }))
}
