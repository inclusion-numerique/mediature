'use client';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredAlertContainerGridProps, centeredContainerGridProps, ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { CaseCard } from '@mediature/ui/src/CaseCard';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export enum ListFilter {
  ALL = 1,
  OPEN_ONLY,
  CLOSE_ONLY,
}

export interface CaseListPageProps {
  params: { authorityId: string };
}

export function CaseListPage({ params: { authorityId } }: CaseListPageProps) {
  const queryRef = React.createRef<HTMLInputElement>();
  const [searchQueryManipulated, setSearchQueryManipulated] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<ListFilter>(ListFilter.ALL);

  const { data, error, isInitialLoading, isLoading, refetch } = trpc.listCases.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
      query: searchQuery,
    },
  });

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQueryManipulated(true);
    setSearchQuery(event.target.value);
    setListFilter(ListFilter.ALL);
  };

  const debounedHandleClearQuery = useMemo(() => debounce(handleSearchQueryChange, 500), []);
  useEffect(() => {
    return () => {
      debounedHandleClearQuery.cancel();
    };
  }, [debounedHandleClearQuery]);

  const casesWrappers = data?.casesWrappers || [];
  const filteredCasesWrappers = useMemo(() => {
    return casesWrappers.filter((caseWrapper) => {
      switch (listFilter) {
        case ListFilter.CLOSE_ONLY:
          return !!caseWrapper.case.closedAt;
        case ListFilter.OPEN_ONLY:
          return !caseWrapper.case.closedAt;
        default:
          return true;
      }
    });
  }, [listFilter, casesWrappers]);

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isInitialLoading && !searchQueryManipulated) {
    return <LoadingArea ariaLabelTarget="page" />;
  }

  const handleClearQuery = () => {
    setSearchQuery(null);
    setListFilter(ListFilter.ALL);

    // We did not bind the TextField to "searchQuery" to allow delaying requests
    if (queryRef.current) {
      queryRef.current.value = '';
    }
  };

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start">
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="h1" variant="h5">
            Tous les dossiers de la collectivité
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: 3 }}>
          <TextField
            type="text"
            name="search"
            label="Rechercher..."
            inputRef={queryRef}
            onChange={debounedHandleClearQuery}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && searchQuery !== '' && (
                    <IconButton aria-label="effacer la recherche" onClick={handleClearQuery}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {!isLoading ? (
          <>
            <Grid item xs={12} sx={{ py: 1 }}>
              <ToggleButtonGroup
                color="primary"
                value={listFilter}
                exclusive
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setListFilter(newValue);
                  }
                }}
                aria-label="Filtre"
              >
                <ToggleButton value={ListFilter.ALL}>Tous</ToggleButton>
                <ToggleButton value={ListFilter.OPEN_ONLY}>Dossiers ouverts</ToggleButton>
                <ToggleButton value={ListFilter.CLOSE_ONLY}>Dossiers clôturés</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            {filteredCasesWrappers.length ? (
              <Grid container component="ul" spacing={3} sx={ulComponentResetStyles}>
                {filteredCasesWrappers.map((caseWrapper) => (
                  <Grid key={caseWrapper.case.id} item component="li" xs={12} sm={6}>
                    <CaseCard
                      caseLink={linkRegistry.get('case', {
                        authorityId: caseWrapper.case.authorityId,
                        caseId: caseWrapper.case.id,
                      })}
                      case={caseWrapper.case}
                      citizen={caseWrapper.citizen}
                      agent={caseWrapper.agent || undefined}
                      unprocessedMessages={caseWrapper.unprocessedMessages || 0}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid item xs={12} sx={{ py: 2 }}>
                <Typography variant="body2">
                  {casesWrappers.length === 0 ? `Aucun dossier n'a été déposé pour le moment` : 'Aucun dossier trouvé avec le filtre choisi'}
                </Typography>
              </Grid>
            )}
          </>
        ) : (
          <LoadingArea ariaLabelTarget="liste des dossiers" />
        )}
      </Grid>
    </>
  );
}
