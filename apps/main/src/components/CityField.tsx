'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import debounce from 'lodash.debounce';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';

import { LocationApiProperties, searchCitiesByPostalCode } from '@mediature/main/src/utils/national-address-base';

export interface CityFieldProps {
  initialValue?: string;
  textFieldProps: TextFieldProps;
  workaroundSetValue?: (newValue: string | null) => void;
  suggestionsPostalCode?: string;
}

export function CityField(props: PropsWithChildren<CityFieldProps>) {
  const [searchCityQuerySuggestions, setSearchCityQuerySuggestions] = useState<LocationApiProperties[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);

  const handleSearchCityQueryChange = async (postalCode: string) => {
    try {
      setSuggestionsLoading(true);

      const suggestions = await searchCitiesByPostalCode(postalCode);
      setSearchCityQuerySuggestions(suggestions);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const debounedHandleClearCityQuery = useMemo(() => debounce(handleSearchCityQueryChange, 500), []);
  useEffect(() => {
    return () => {
      debounedHandleClearCityQuery.cancel();
    };
  }, [debounedHandleClearCityQuery]);

  useEffect(() => {
    if (props.suggestionsPostalCode && props.suggestionsPostalCode.length > 0) {
      debounedHandleClearCityQuery(props.suggestionsPostalCode);
    } else {
      setSearchCityQuerySuggestions([]);
    }
  }, [props.suggestionsPostalCode, debounedHandleClearCityQuery, setSearchCityQuerySuggestions]);

  return (
    <Autocomplete
      value={props.initialValue}
      options={searchCityQuerySuggestions.map((suggestion): string => {
        return suggestion.city;
      })}
      renderOption={(props, option) => {
        // Redeclare to avoid "spread JSX" error (ref: https://stackoverflow.com/a/75968316/3608410)
        // (the `key` is not ideal but it should be unique)
        return (
          <li {...props} key={option}>
            {option}
          </li>
        );
      }}
      isOptionEqualToValue={(option, value) => JSON.stringify(option) === JSON.stringify(value)} // Since it relies on object addresses we provide a hard way (no unique ID for addresses)
      getOptionLabel={(option) => {
        return option;
      }}
      onChange={(event, newValue) => {
        // [WORKAROUND] When selecting an item it won't update the input value
        // and there is no way to bind by reference or both onChange... so using additional setValue from the parent
        if (props.workaroundSetValue) {
          props.workaroundSetValue(newValue);
        }
      }}
      loading={suggestionsLoading}
      freeSolo
      selectOnFocus
      handleHomeEndKeys
      fullWidth
      // Unable to prevent the autocomplete for address from Chrome despite `autoComplete="false"` so giving up
      renderInput={(params) => <TextField {...params} {...props.textFieldProps} />}
    />
  );
}
