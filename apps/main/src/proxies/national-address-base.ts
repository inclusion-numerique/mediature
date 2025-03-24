import { areMocksGloballyEnabled } from '@mediature/main/src/utils/environment';
import { searchCitiesByPostalCode as real_searchCitiesByPostalCode } from '@mediature/main/src/utils/national-address-base';

const mock_searchCitiesByPostalCode: typeof real_searchCitiesByPostalCode = async function (postalCode: string) {
  console.log(`"searchCitiesByPostalCode" mock has been called`);

  return [
    {
      label: 'Brest',
      score: 0.8670363636363636,
      id: '29019',
      banId: '148bf034-3697-4795-be8e-893f23e0eaef',
      type: 'municipality',
      name: 'Brest',
      postcode: '29200',
      citycode: '29019',
      x: 145944.42,
      y: 6838118.24,
      population: 139619,
      city: 'Brest',
      context: '29, Finistère, Bretagne',
      importance: 0.5374,
      municipality: 'Brest',
      _type: 'address',
    },
  ];
};

export const searchCitiesByPostalCode: typeof real_searchCitiesByPostalCode = areMocksGloballyEnabled()
  ? mock_searchCitiesByPostalCode
  : real_searchCitiesByPostalCode;
