import { config } from 'dotenv'
import fsp from 'fs/promises'

config()

const API_ENDPOINT = 'https://www.sreality.cz/api'
const SEARCH_PATH = '/cs/v2/estates'
const DISTANCE_PATH = '/cs/v2/rus/locality/'
const CTU_T_GPS_PARAMS = '&lat=50.1024983333&lon=14.3927758333'
const CTU_K_GPS_PARAMS = '&lat=50.074575&lon=14.420309'
const PRICE_HINT_NAME = 'Poznámka k ceně'

type SearchParams = {
  category: 1
  subCategory: (3 | 4 | 5)[]
  categoryType: 'buy' | 'rent'
  maxPrice?: number
  furnished?: ('yes' | 'no' | 'partially')[]
  districtId?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]
  regionId?: number
  limit?: number
  page?: number
}

type SearchResponse = {
  _embedded: {
    estates: EstatePreviewResponse[]
  }
}

type EstatePreviewResponse = {
  _links: {
    self: {
      href: string
    }
  }
  is_auction: boolean
  gps: {
    lat: number
    lon: number
  }
}

type EstateDetailsResponse = {
  text: {
    value: string
  }
  meta_description: string
  locality: {
    value: string
  }
  price_czk: {
    value_raw?: number
  }
  name: {
    value: string
  }
  items: {
    name: string
    value: string | boolean | number
  }[]
  recommendations_data: {
    hash_id: number
  }
}

type EstateDistanceResponse = {
  _embedded: {
    advert_path: {
      paths: [
        {
          path_duration: number
          path_distance: number
        }
      ]
    }
  }
}

type EstateDetails = {
  id: number
  name: string
  description: string
  metaDescription: string
  priceHint: string
  basePrice?: number
  locality: string
  routes: {
    ctuT: { time: number; distance: number }
    ctuK: { time: number; distance: number }
  }
}

function createSearchUrl(params: SearchParams) {
  const url = new URL(`${API_ENDPOINT}${SEARCH_PATH}`)
  url.searchParams.append('category_main_cb', params.category.toString())
  url.searchParams.append('category_sub_cb', params.subCategory.join('|'))
  url.searchParams.append(
    'category_type_cb',
    params.categoryType === 'rent' ? '2' : '1'
  )
  if (params.maxPrice) {
    url.searchParams.append(
      'czk_price_summary_order2',
      params.maxPrice.toString()
    )
  }
  if (params.furnished) {
    const furnished = params.furnished.map(
      value =>
        ({
          yes: 1,
          partially: 2,
          no: 3
        })[value]
    )
    url.searchParams.append('furnished', furnished.join('|'))
  }
  if (params.districtId) {
    url.searchParams.append(
      'locality_district_id',
      params.districtId.map(id => `500${id}`).join('|')
    )
  }
  if (params.regionId) {
    url.searchParams.append('locality_region_id', params.regionId.toString())
  }
  if (params.limit) {
    url.searchParams.append('per_page', params.limit.toString())
  }
  if (params.page) {
    url.searchParams.append('page', params.page.toString())
  }
  return url
}

async function httpCall<T>(
  url: URL | string,
  appendToApi = false
): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> {
  try {
    const uri = `${appendToApi ? API_ENDPOINT : ''}${url}`
    const response = await fetch(uri, {
      headers: {
        Cookie: `ds=${process.env.SREALITY_AUTH};`
      }
    })
    const result = await response.json()
    return {
      ok: true,
      data: result as T
    }
  } catch (error) {
    return {
      ok: false,
      error
    }
  }
}

export async function fetchEstateDetails(url: string): Promise<EstateDetails> {
  const response = await httpCall<EstateDetailsResponse>(url, true)
  if (!response.ok) {
    console.log({ error: response.error }, 'Estate details fetch failed')
    process.exit(1)
  }

  const estateId = response.data.recommendations_data.hash_id
  const routeT = await fetchEstateRoute(estateId, CTU_T_GPS_PARAMS)
  const routeK = await fetchEstateRoute(estateId, CTU_K_GPS_PARAMS)

  return {
    id: estateId,
    name: response.data.name.value,
    description: response.data.text.value,
    metaDescription: response.data.meta_description,
    priceHint:
      response.data.items
        .find(item => item.name === PRICE_HINT_NAME)
        ?.value.toString() ?? '',
    basePrice: response.data.price_czk.value_raw,
    locality: response.data.locality.value,
    routes: {
      ctuT: routeT,
      ctuK: routeK
    }
  }
}

export async function fetchEstateRoute(estateId: number, gpsParams: string) {
  const url = `${DISTANCE_PATH}/${estateId}?transport=by_pubt${gpsParams}`
  const response = await httpCall<EstateDistanceResponse>(url, true)
  if (!response.ok) {
    console.log({ error: response.error }, 'Estate distance request failed')
    process.exit(1)
  }

  const duration =
    response.data._embedded.advert_path.paths[0].path_duration / 60
  const distance =
    response.data._embedded.advert_path.paths[0].path_distance / 1000

  return {
    time: Number(duration.toFixed(3)),
    distance: Number(distance.toFixed(3))
  }
}

export async function search(params: SearchParams) {
  const response = await httpCall<SearchResponse>(createSearchUrl(params))
  if (!response.ok) {
    console.log({ error: response.error }, 'Search request failed')
    process.exit(1)
  }
  const estates: EstateDetails[] = []
  for (const estatePreview of response.data._embedded.estates) {
    if (estatePreview.is_auction) {
      console.warn('W | Skipping auction apartment')
      continue
    }
    const estateDetails = await fetchEstateDetails(
      estatePreview._links.self.href
    )
    estates.push(estateDetails)
  }
  return estates
}

const PAGES = 1
const PER_PAGE = 10

console.info(`I | Starting process of ${PAGES}x${PER_PAGE} estates`)

for (let page = 1; page <= PAGES; ++page) {
  console.info(`I | Fetching page ${page}`)
  const estates = await search({
    category: 1,
    subCategory: [3, 4, 5],
    categoryType: 'rent',
    maxPrice: 30_000,
    furnished: ['no', 'partially'],
    districtId: [1, 2, 3, 4, 5, 6, 7, 8],
    regionId: 10,
    limit: PER_PAGE
  })
  if (estates.length === 0) {
    console.warn(`W | Finishing on page ${page - 1} (no estates left)`)
    process.exit(0)
  }
  console.info(`I | Writing ${estates.length} estates`)
  await fsp.writeFile(
    `./estates/page-${page}.json`,
    JSON.stringify(estates),
    'utf-8'
  )
}

console.info('I | Done')
