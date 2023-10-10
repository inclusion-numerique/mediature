export const baseUrl = 'https://api-adresse.data.gouv.fr';

export interface LocationApiProperties {
  id: string;
  postcode: string;
  city: string;
}

export interface LocationApiFeature {
  properties: LocationApiProperties;
}

export interface LocationApiSearchCitiesByPostalCodeResponse {
  features: LocationApiFeature[];
}

export async function searchCitiesByPostalCode(postalCode: string): Promise<LocationApiProperties[]> {
  // Wanted to add `lat` and `lon` as query parameter to return address around this position
  // but after multiple tests it does not seem to work well
  const url = new URL(`${baseUrl}/search/`);
  url.searchParams.append('q', postalCode);
  url.searchParams.append('type', 'municipality'); // Ask for cities
  url.searchParams.append('limit', '100'); // Do not limit to the default 5 results

  const response = await window.fetch(url);

  if (response.ok) {
    const data = (await response.json()) as LocationApiSearchCitiesByPostalCodeResponse;

    return data.features.map((feature) => feature.properties);
  } else {
    const error = await response.json();

    throw error;
  }
}
