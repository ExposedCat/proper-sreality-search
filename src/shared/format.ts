import type { EstateDetails } from '../api/details.js'

const BASE_PRICE_PREFIX = 'Základní cena: '
const PRICE_HINT_PREFIX = 'Cenový tip: '
const META_DESCRIPTION_PREFIX = 'Krátký: '

export function getFullEstateDescription(estate: EstateDetails) {
  const description = estate.description
    .replaceAll('\\r\\n', ' ')
    .replaceAll('\n', ' ')
    .replaceAll(/<\/?(?:p|br) ?\/?>/g, '')

  const price = estate.basePrice
    ? `${BASE_PRICE_PREFIX}${estate.basePrice}`
    : ''
  const priceHint = estate.priceHint
    ? `${PRICE_HINT_PREFIX}${estate.priceHint}`
    : ''
  const metaDescription = estate.metaDescription
    ? `${META_DESCRIPTION_PREFIX}${estate.metaDescription}`
    : ''

  return `${description} ${metaDescription} ${price}. ${priceHint}`
}
