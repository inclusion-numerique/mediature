'use client';

import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import debounce from 'lodash.debounce';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { CaseList } from '@mediature/main/src/components/CaseList';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { ListDisplay, useLocalStorageListDisplay } from '@mediature/main/src/utils/display';
import { centeredAlertContainerGridProps, centeredContainerGridProps } from '@mediature/main/src/utils/grid';

export enum ListFilter {
  ALL = 1,
  OPEN_ONLY,
  CLOSE_ONLY,
}

export const MyCasesPageContext = createContext({
  ContextualCaseList: CaseList,
});

export interface MyCasesPageProps {
  params: { authorityId: string };
}

export function MyCasesPage({ params: { authorityId } }: MyCasesPageProps) {
  const { ContextualCaseList } = useContext(MyCasesPageContext);

  const queryRef = React.createRef<HTMLInputElement>();
  const [searchQueryManipulated, setSearchQueryManipulated] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<ListFilter>(ListFilter.ALL);
  const [listDisplay, setListDisplay] = useLocalStorageListDisplay();

  const { data, error, isInitialLoading, isLoading, refetch } = trpc.listCases.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
      agentIds: null,
      query: searchQuery,
      mine: true,
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

  const casesWrappers = useMemo(() => data?.casesWrappers || [], [data]);
  const filteredCasesWrappers = useMemo(() => {
    return casesWrappers
      .filter((caseWrapper) => {
        switch (listFilter) {
          case ListFilter.CLOSE_ONLY:
            return !!caseWrapper.case.closedAt;
          case ListFilter.OPEN_ONLY:
            return !caseWrapper.case.closedAt;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (a.unprocessedMessages !== null && b.unprocessedMessages !== null) {
          const aSimplifiedUM = a.unprocessedMessages > 0 ? 1 : 0;
          const bSimplifiedUM = b.unprocessedMessages > 0 ? 1 : 0;

          if (aSimplifiedUM !== bSimplifiedUM) {
            return bSimplifiedUM - aSimplifiedUM;
          }
        }

        return +(a.case.termReminderAt || 0) - +(b.case.termReminderAt || 0);
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
            {/* TODO: manage multiple ones when main agent */}
            Mes dossiers
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
              <Grid container spacing={1} alignContent="flex-start">
                <Grid item>
                  <ToggleButtonGroup
                    color="primary"
                    value={listFilter}
                    exclusive
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        setListFilter(newValue);
                      }
                    }}
                    aria-label="filtre"
                  >
                    <ToggleButton value={ListFilter.ALL}>Tous</ToggleButton>
                    <ToggleButton value={ListFilter.OPEN_ONLY}>Dossiers ouverts</ToggleButton>
                    <ToggleButton value={ListFilter.CLOSE_ONLY}>Dossiers clôturés</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item sx={{ ml: 'auto' }}>
                  <ToggleButtonGroup
                    color="primary"
                    value={listDisplay}
                    exclusive
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        setListDisplay(newValue);
                      }
                    }}
                    aria-label="affichage de la liste"
                  >
                    <ToggleButton value={ListDisplay.GRID} aria-label="grille">
                      <GridViewIcon />
                    </ToggleButton>
                    <ToggleButton value={ListDisplay.TABLE} aria-label="tableau">
                      <TableRowsIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </Grid>
            {filteredCasesWrappers.length ? (
              <ContextualCaseList casesWrappers={filteredCasesWrappers} assignableAgents={[]} canUnassign canDelete display={listDisplay} />
            ) : (
              <Grid item xs={12} sx={{ py: 2 }}>
                <Typography variant="body2">
                  {casesWrappers.length === 0 ? 'Vous ne traitez actuellement aucun dossier' : 'Aucun dossier trouvé avec le filtre choisi'}
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
