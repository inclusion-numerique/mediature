import { Country, countries } from 'country-data';

export function formatList(countries: ReadonlyArray<Country>, countriesToPrioritize?: string[]): Country[] {
  // Note: countries to prioritize are defined by their code alpha2

  const prioritizedCountries: Country[] = [];
  const remainingCountriesToSort: Country[] = [];

  for (const country of countries) {
    // First, we filter all countries that are no longer valid
    if (country.status !== 'assigned') {
      continue;
    }

    // Add to the right list to process depending on priorization
    if (countriesToPrioritize && countriesToPrioritize.indexOf(country.alpha2) !== -1) {
      prioritizedCountries.push(country);
    } else {
      remainingCountriesToSort.push(country);
    }
  }

  // Sort priotized list by given order
  let sortedPrioritedCountries: Country[];
  if (countriesToPrioritize) {
    sortedPrioritedCountries = prioritizedCountries.sort((a, b) => {
      return countriesToPrioritize.indexOf(a.alpha2) - countriesToPrioritize.indexOf(b.alpha2);
    });
  } else {
    sortedPrioritedCountries = [];
  }

  // Sort basic list by alphabetical order
  const sortedRemainingCountries = remainingCountriesToSort.sort((a, b) => {
    // Lowercase since letter ordering is case sensitive
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });

  // Return the full list
  return sortedPrioritedCountries.concat(sortedRemainingCountries);
}

export const mostUsedSortedCountries = formatList(countries.all, ['FR']);
