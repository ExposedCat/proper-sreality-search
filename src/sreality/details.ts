import { httpCall } from '../utils/http.js';
import type { EstateDetailsResponse, EstateDistanceResponse } from './response.js';

const DISTANCE_PATH = '/cs/v2/rus/locality/';
// const CTU_T_GPS_PARAMS = '&lat=50.1024983333&lon=14.3927758333'
// const CTU_K_GPS_PARAMS = '&lat=50.074575&lon=14.420309'
const PRICE_HINT_NAME = 'Poznámka k ceně';

export type EstateDetails = {
  id: number;
  name: string;
  description: string;
  metaDescription: string;
  priceHint: string;
  basePrice?: number;
  locality: string;
  // routes: {
  //   ctuT: { time: number; distance: number }
  //   ctuK: { time: number; distance: number }
  // }
};

export async function fetchEstateRoute(args: { estateId: number; gpsParams: string }) {
  const { estateId, gpsParams } = args;
  const url = `${DISTANCE_PATH}/${estateId}?transport=by_pubt${gpsParams}`;
  const response = await httpCall<EstateDistanceResponse>({
    url,
    appendToApi: true,
  });
  if (!response.ok) {
    console.log({ error: response.error }, 'Estate distance request failed');
    process.exit(1);
  }

  console.log(response.data);

  const duration = response.data._embedded.advert_path.paths[0].path_duration / 60;
  const distance = response.data._embedded.advert_path.paths[0].path_distance / 1000;

  return {
    time: Number(duration.toFixed(3)),
    distance: Number(distance.toFixed(3)),
  };
}

export async function fetchEstateDetails(args: { url: string }): Promise<EstateDetails> {
  const { url } = args;
  const response = await httpCall<EstateDetailsResponse>({
    url,
    appendToApi: true,
  });
  if (!response.ok) {
    console.log({ error: response.error }, 'Estate details fetch failed');
    process.exit(1);
  }

  const estateId = response.data.recommendations_data.hash_id;
  // const routeT = await fetchEstateRoute({
  //   estateId,
  //   gpsParams: CTU_T_GPS_PARAMS
  // })
  // const routeK = await fetchEstateRoute({
  //   estateId,
  //   gpsParams: CTU_K_GPS_PARAMS
  // })

  return {
    id: estateId,
    name: response.data.name.value,
    description: response.data.text.value,
    metaDescription: response.data.meta_description,
    priceHint: response.data.items.find(item => item.name === PRICE_HINT_NAME)?.value.toString() ?? '',
    basePrice: response.data.price_czk.value_raw,
    locality: response.data.locality.value,
    // routes: {
    //   ctuT: routeT,
    //   ctuK: routeK
    // }
  };
}
