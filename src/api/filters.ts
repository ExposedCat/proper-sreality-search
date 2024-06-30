// Type
export const FILTER_TYPE = 'category_sub_cb'

export type FilterType =
  | 'flat'
  | '1kk'
  | '11'
  | '2kk'
  | '21'
  | '3kk'
  | '31'
  | '4kk'
  | '41'
  | '5kk'
  | '51'
  | '6'
  | 'other'

export const FILTER_TYPE_ID: Record<FilterType, number> = {
  flat: 47,
  '1kk': 2,
  '11': 3,
  '2kk': 4,
  '21': 5,
  '3kk': 6,
  '31': 7,
  '4kk': 8,
  '41': 9,
  '5kk': 10,
  '51': 11,
  '6': 12,
  other: 16
}

// Region
export const FILTER_REGION = 'locality_region_id'

export type FilterRegion =
  | 'karlovarsky'
  | 'ustecky'
  | 'liberecky'
  | 'plzensky'
  | 'stredocesky'
  | 'praha'
  | 'kralovehradecky'
  | 'jihocesky'
  | 'vysocina'
  | 'pardubicky'
  | 'jihomoravsky'
  | 'olomoucky'
  | 'moravskoslezsky'
  | 'zlinsky'

export const FILTER_REGION_ID: Record<FilterRegion, number> = {
  karlovarsky: 3,
  ustecky: 4,
  liberecky: 5,
  plzensky: 2,
  stredocesky: 11,
  praha: 10,
  kralovehradecky: 6,
  jihocesky: 1,
  vysocina: 13,
  pardubicky: 7,
  jihomoravsky: 14,
  olomoucky: 8,
  moravskoslezsky: 12,
  zlinsky: 9
}

// Condition
export const FILTER_CONDITION = 'building_condition'

export type FilterCondition =
  | 'decent'
  | 'good'
  | 'bad'
  | 'construction'
  | 'developer'
  | 'new'
  | 'demolition'
  | 'beforeReconstruction'
  | 'afterReconstruction'
  | 'underReconstruction'

export const FILTER_CONDITION_ID: Record<FilterCondition, number> = {
  decent: 1,
  good: 2,
  bad: 3,
  construction: 4,
  developer: 5,
  new: 6,
  demolition: 7,
  beforeReconstruction: 8,
  afterReconstruction: 9,
  underReconstruction: 10
}

// Districts
// TODO: Other region districts
export const FILTER_DISTRICT = 'locality_district_id'

export type FilterDistrict =
  | 'prague1'
  | 'prague2'
  | 'prague3'
  | 'prague4'
  | 'prague5'
  | 'prague6'
  | 'prague7'
  | 'prague8'
  | 'prague9'
  | 'prague10'

export const FILTER_DISTRICT_ID: Record<FilterDistrict, number> = {
  prague1: 5001,
  prague2: 5002,
  prague3: 5003,
  prague4: 5004,
  prague5: 5005,
  prague6: 5006,
  prague7: 5007,
  prague8: 5008,
  prague9: 5009,
  prague10: 5010
}

// Building type
export const FILTER_BUILDING_TYPE = 'building_type_search'

export type FilterBuildingType = 'panel' | 'concrete' | 'other'

export const FILTER_BUILDING_TYPE_ID: Record<FilterBuildingType, number> = {
  panel: 1,
  concrete: 2,
  other: 3
}

// Energy efficiency
export const FILTER_ENERGY_EFFICIENCY = 'energy_efficiency_rating_search'

export type FilterEnergyEfficiency = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export const FILTER_ENERGY_EFFICIENCY_ID: Record<
  FilterEnergyEfficiency,
  number
> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7
}

// Furnished
export const FILTER_FURNISHED = 'furnished'

export type FilterFurnished = 'yes' | 'no' | 'partially'

export const FILTER_FURNISHED_ID: Record<FilterFurnished, number> = {
  yes: 1,
  no: 2,
  partially: 3
}

// Date
export const FILTER_DATE = 'ready_date'

export type DateString = `${number}-${number}-${number}`

export type FilterDate =
  | `${DateString}|`
  | `${DateString}|${DateString}`
  | `|${DateString}`
  | 'now'

// Extras
export const FILTER_EXTRA_1 = 'something_more1'

export type FilterExtra1 = 'balcony' | 'terrace' | 'loggia' | 'shop' | 'garden'

export const FILTER_EXTRA_1_ID: Record<FilterExtra1, number> = {
  balcony: 3090,
  terrace: 3110,
  loggia: 3100,
  shop: 3120,
  garden: 20222
}

export const FILTER_EXTRA_2 = 'something_more2'

export type FilterExtra2 = 'parking' | 'garage'

export const FILTER_EXTRA_2_ID: Record<FilterExtra2, number> = {
  parking: 3140,
  garage: 3150
}

export const FILTER_EXTRA_3 = 'something_more3'

export type FilterExtra3 = 'elevator' | 'accessible'

export const FILTER_EXTRA_3_ID: Record<FilterExtra3, number> = {
  elevator: 3310,
  accessible: 1820
}

// Floor
export const FILTER_FLOOR = 'floor_number'

export type FilterFloor = `${number}|${number}`

// Area
export const FILTER_USABLE_AREA = 'usable_area'

export type FilterUsableArea = `${number}|${number}`

// Age
export const FILTER_AGE = 'estate_age'

export type FilterAge = 'day' | 'week' | 'month'

export const FILTER_AGE_ID: Record<FilterAge, number> = {
  day: 2,
  week: 8,
  month: 31
}

// Price
export const FILTER_PRICE = 'czk_price_summary_order2'

export type FilterPrice = `${number}` | `${number}|${number}`

export type FilterOptions = {
  types?: FilterType[]
  regions?: FilterRegion[]
  conditions?: FilterCondition[]
  districts?: FilterDistrict[]
  buildingTypes?: FilterBuildingType[]
  energyEfficiencies?: FilterEnergyEfficiency[]
  furnished?: FilterFurnished[]
  extras1?: FilterExtra1[]
  extras2?: FilterExtra2[]
  extras3?: FilterExtra3[]
  dates?:
    | {
        from?: Date
        to?: Date
      }
    | { now: true }

  prices?: {
    from?: number
    to?: number
  }
}
