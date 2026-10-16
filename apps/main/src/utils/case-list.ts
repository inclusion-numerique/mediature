import debounce from 'lodash.debounce';
import { parseAsInteger, parseAsNumberLiteral, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { possiblePageSizes } from '@mediature/main/src/components/ListPagination';
import { PaginationSize } from '@mediature/main/src/models/actions/common';

export enum ListFilter {
  ALL = 'all',
  OPEN_ONLY = 'open',
  CLOSE_ONLY = 'closed',
}

export function useCaseListUrlState() {
  const queryRef = useRef<HTMLInputElement>(null);
  const [searchQueryManipulated, setSearchQueryManipulated] = useState(false);

  // Keeping the list state into the URL so going back from a case lands on the same results
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      filter: parseAsStringEnum<ListFilter>(Object.values(ListFilter)).withDefault(ListFilter.ALL),
      page: parseAsInteger.withDefault(1),
      size: parseAsNumberLiteral<PaginationSize>(possiblePageSizes).withDefault(possiblePageSizes[0]),
    },
    { history: 'push', clearOnDefault: true }
  );

  const hasSearchQuery = params.q.trim().length > 0;
  const searchQuery = hasSearchQuery ? params.q : null;
  const listFilter = params.filter;
  const page = Math.max(1, params.page); // The URL can be manually edited, and the API only accepts positive pages
  const pageSize = params.size;

  // Fix the URL if the page was not a valid one (no new history entry, otherwise going back would land on the invalid page again)
  useEffect(() => {
    if (params.page !== page) {
      setParams({ page: page }, { history: 'replace' });
    }
  }, [params.page, page, setParams]);

  const handleSearchQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (next !== params.q) {
        setSearchQueryManipulated(true);

        // Reset to page 1 since the new query may yield a much smaller total set
        // Note: replacing the history entry to avoid having each typing pause as a step of the browser "back" button
        setParams({ q: next || null, filter: null, page: 1 }, { history: 'replace' });
      }
    },
    [params.q, setParams]
  );

  const debouncedSearchChange = useMemo(() => debounce(handleSearchQueryChange, 500), [handleSearchQueryChange]);
  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  // The input is uncontrolled (debounce-friendly) so when the URL `q` changes from outside (browser back...)
  // we need to push the new value back into the DOM input
  // Note: it must only run when `q` changes, otherwise any rerender would erase what is being typed during the debounce delay
  useEffect(() => {
    if (queryRef.current && queryRef.current.value !== params.q) {
      queryRef.current.value = params.q;
    }
  }, [params.q]);

  const clearQuery = useCallback(() => {
    debouncedSearchChange.cancel();
    setParams({ q: null, filter: null, page: 1 });

    // We did not bind the TextField to "searchQuery" to allow delaying requests
    if (queryRef.current) {
      queryRef.current.value = '';
    }
  }, [debouncedSearchChange, setParams]);

  const setListFilter = useCallback(
    (newFilter: ListFilter) => {
      setParams({ filter: newFilter, page: 1 });
    },
    [setParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setParams({ page: newPage });
    },
    [setParams]
  );

  const setPageSize = useCallback(
    (newPageSize: PaginationSize) => {
      setParams({ size: newPageSize, page: 1 }); // A bigger page size shrinks the total pages, so go back to a guaranteed-valid page
    },
    [setParams]
  );

  // Adjust the page in case the server removes some items in the meantime (to be fed with the fetched total)
  // Note: no new history entry, otherwise going back would land on the out-of-range page again
  const [totalCount, setTotalCount] = useState<number | null>(null);
  useEffect(() => {
    if (totalCount === null) {
      return;
    }

    const pagesCount = Math.max(1, Math.ceil(totalCount / pageSize));

    if (page > pagesCount) {
      setParams({ page: pagesCount }, { history: 'replace' });
    }
  }, [totalCount, page, pageSize, setParams]);

  return {
    queryRef,
    searchQueryManipulated,
    rawSearchQuery: params.q,
    hasSearchQuery,
    searchQuery,
    listFilter,
    closedFilter: listFilter === ListFilter.CLOSE_ONLY ? true : listFilter === ListFilter.OPEN_ONLY ? false : null,
    page,
    pageSize,
    debouncedSearchChange,
    clearQuery,
    setListFilter,
    setPage,
    setPageSize,
    setTotalCount,
  };
}
