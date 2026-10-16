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
import { createContext, useContext, useEffect, useMemo } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { CaseList } from '@mediature/main/src/components/CaseList';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { ListPagination } from '@mediature/main/src/components/ListPagination';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { useUserInterfaceAuthority } from '@mediature/main/src/components/user-interface-session/useUserInterfaceSession';
import { ListFilter, useCaseListUrlState } from '@mediature/main/src/utils/case-list';
import { ListDisplay, useLocalStorageListDisplay } from '@mediature/main/src/utils/display';
import { centeredAlertContainerGridProps, centeredContainerGridProps } from '@mediature/main/src/utils/grid';
import { AggregatedQueries } from '@mediature/main/src/utils/trpc';

export const CaseListPageContext = createContext({
  ContextualCaseList: CaseList,
});

export interface CaseListPageProps {
  params: { authorityId: string };
}

export function CaseListPage({ params: { authorityId } }: CaseListPageProps) {
  const { ContextualCaseList } = useContext(CaseListPageContext);
  const { userInterfaceAuthority } = useUserInterfaceAuthority(authorityId);

  const [listDisplay, setListDisplay] = useLocalStorageListDisplay();
  const listState = useCaseListUrlState();

  const listCases = trpc.listCases.useQuery(
    {
      page: listState.page,
      pageSize: listState.pageSize,
      orderBy: {},
      filterBy: {
        authorityIds: [authorityId],
        query: listState.searchQuery,
        closed: listState.closedFilter,
      },
    },
    {
      keepPreviousData: true, // Avoid flashing a loading area when switching pages
    }
  );

  const listAssignableAgents = trpc.listAgents.useQuery({
    orderBy: {},
    filterBy: {
      authorityIds: [authorityId],
    },
  });

  const aggregatedQueries = new AggregatedQueries(listCases, listAssignableAgents);

  const casesWrappers = useMemo(() => listCases.data?.casesWrappers || [], [listCases.data]);
  const totalCount = listCases.data?.totalCount ?? 0;

  const { setTotalCount } = listState;
  useEffect(() => {
    // Previous data (kept while loading) may come from other criteria so it must not be used to adjust the page
    setTotalCount(listCases.data && !listCases.isPreviousData ? listCases.data.totalCount : null);
  }, [listCases.data, listCases.isPreviousData, setTotalCount]);

  if (aggregatedQueries.hasError) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={aggregatedQueries.errors} refetchs={aggregatedQueries.refetchs} />
      </Grid>
    );
  } else if (aggregatedQueries.isLoading && !listState.searchQueryManipulated) {
    return <LoadingArea ariaLabelTarget="page" />;
  }

  const assignableAgents = listAssignableAgents.data?.agentsWrappers.map((agentWrapper) => agentWrapper.agent);

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start">
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="h1" variant="h5">
            Dossiers de la collectivité
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: 3 }}>
          <TextField
            type="text"
            name="search"
            label="Rechercher..."
            inputRef={listState.queryRef}
            defaultValue={listState.rawSearchQuery}
            onChange={listState.debouncedSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {listState.hasSearchQuery && (
                    <IconButton aria-label="effacer la recherche" onClick={listState.clearQuery}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {!aggregatedQueries.isLoading ? (
          <>
            <Grid item xs={12} sx={{ py: 1 }}>
              <Grid container spacing={1} alignContent="flex-start">
                <Grid item>
                  <ToggleButtonGroup
                    color="primary"
                    value={listState.listFilter}
                    exclusive
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        listState.setListFilter(newValue);
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
            {totalCount > 0 ? (
              <>
                <ContextualCaseList
                  casesWrappers={casesWrappers}
                  assignableAgents={assignableAgents || []}
                  canTransfer={userInterfaceAuthority?.isMainAgent}
                  display={listDisplay}
                />
                <ListPagination
                  page={listState.page}
                  pageSize={listState.pageSize}
                  totalCount={totalCount}
                  itemLabel={(count) => `${count} dossier${count > 1 ? 's' : ''}`}
                  onPageChange={listState.setPage}
                  onPageSizeChange={listState.setPageSize}
                />
              </>
            ) : (
              <Grid item xs={12} sx={{ py: 2 }}>
                <Typography variant="body2">
                  {listState.listFilter === ListFilter.ALL && !listState.hasSearchQuery
                    ? `Aucun dossier n'a été déposé pour le moment`
                    : 'Aucun dossier trouvé avec le filtre choisi'}
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
