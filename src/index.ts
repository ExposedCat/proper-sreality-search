import { config } from 'dotenv'
import fsp from 'fs/promises'

import { searchEstates } from './api/search.js'
import type { EstateDetails } from './api/details.js'
import { fetchEstateDetails } from './api/details.js'
import { getFullEstateDescription } from './shared/format.js'
// import { EstatesParsingModel } from './ai-engine/index.js'

config()

const PAGES = Number(process.env.PAGES ?? 5)
const PER_PAGE = Number(process.env.PER_PAGE ?? 10)

// console.info('I | Starting AI model')
// const model = new EstatesParsingModel()

console.info(`I | Starting process of parsing ${PAGES}x${PER_PAGE} estates`)

for (let page = 1; page <= PAGES; ++page) {
  console.info(`I | Fetching page ${page}`)
  const estatePreviews = await searchEstates({
    types: ['2kk', '21'],
    prices: {
      to: 30_000
    },
    furnished: ['no', 'partially'],
    regions: ['praha'],
    dates: { now: true }
  })
  if (estatePreviews.length === 0) {
    console.warn(`W | Finishing on page ${page - 1} (no estates left)`)
    process.exit(0)
  }
  const estates: EstateDetails[] = []
  for (const preview of estatePreviews) {
    console.info('I | Getting estate details')
    const estate = await fetchEstateDetails({
      url: preview.url
    })
    estates.push(estate)
    const fullDescription = getFullEstateDescription(estate)
    console.info('D | Got estate details:', fullDescription)
    // console.info('I | Parsing estate description')
    // try {
    //   const result = await model.parseEstateDescription(fullDescription)
    //   const parsed = JSON.parse(result)
    //   console.info('I | Parsed estate description:', parsed)
    // } catch (error) {
    //   console.info('E | Parsing failed', error)
    // }
  }
  console.info(`I | Writing ${estatePreviews.length} estates`)
  await fsp.writeFile(
    `./estates/page-${page}.json`,
    JSON.stringify(estates, null, 2),
    'utf-8'
  )
}

console.info('I | Done')
