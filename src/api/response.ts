export type EstatePreviewResponse = {
  _links: {
    self: {
      href: string
    }
  }
  is_auction: boolean
}

export type SearchResponse = {
  _embedded: {
    estates: EstatePreviewResponse[]
  }
}

export type EstateDetailsResponse = {
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

export type EstateDistanceResponse = {
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
