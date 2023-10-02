'use client';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { centeredAlertContainerGridProps, centeredContainerGridProps, ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { CaseCard } from '@mediature/ui/src/CaseCard';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';

export interface MyCasesPageProps {
  params: { authorityId: string };
}

export function MyCasesPage({ params: { authorityId } }: MyCasesPageProps) {
  const queryRef = React.createRef<HTMLInputElement>();
  const [searchQueryManipulated, setSearchQueryManipulated] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

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
  };

  const debounedHandleClearQuery = useMemo(() => debounce(handleSearchQueryChange, 500), []);
  useEffect(() => {
    return () => {
      debounedHandleClearQuery.cancel();
    };
  }, [debounedHandleClearQuery]);

  const casesWrappers = data?.casesWrappers || [];
  const openCasesWrappers = casesWrappers
    .filter((caseWrapper) => {
      return !caseWrapper.case.closedAt;
    })
    .sort((a, b) => {
      return +(a.case.termReminderAt || 0) - +(b.case.termReminderAt || 0);
    });
  const closeCasesWrappers = casesWrappers
    .filter((caseWrapper) => {
      return !!caseWrapper.case.closedAt;
    })
    .sort((a, b) => {
      return +(b.case.closedAt as Date) - +(a.case.closedAt as Date);
    });

  const unassignCase = trpc.unassignCase.useMutation();
  const deleteCase = trpc.deleteCase.useMutation();
  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isInitialLoading && !searchQueryManipulated) {
    return <LoadingArea ariaLabelTarget="page" />;
  }

  const unassignCaseAction = async (caseId: string, agentId: string) => {
    showConfirmationDialog({
      description: <>Êtes-vous sûr de vouloir vous désassigner de ce dossier ?</>,
      onConfirm: async () => {
        await unassignCase.mutateAsync({
          caseId: caseId,
          agentId: agentId,
        });
      },
    });
  };

  const deleteCaseAction = async (caseToDelete: CaseSchemaType) => {
    showConfirmationDialog({
      description: (
        <>
          Êtes-vous sûr de vouloir supprimer le dossier n°{caseToDelete.humanId} ?
          <br />
          <br />
          <Typography component="span" sx={{ fontStyle: 'italic' }}>
            Tous les éléments qu&apos;il contient seront définitivement supprimés.
          </Typography>
        </>
      ),
      onConfirm: async () => {
        await deleteCase.mutateAsync({
          caseId: caseToDelete.id,
        });
      },
    });
  };

  const handleClearQuery = () => {
    setSearchQuery(null);

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
            <Grid item xs={12} sx={{ py: 3 }}>
              <Typography component="h2" variant="h6">
                Dossiers ouverts
              </Typography>
            </Grid>
            {openCasesWrappers.length ? (
              <Grid container component="ul" spacing={3} sx={ulComponentResetStyles}>
                {openCasesWrappers.map((caseWrapper) => (
                  <Grid key={caseWrapper.case.id} item component="li" xs={12} sm={6}>
                    <CaseCard
                      caseLink={linkRegistry.get('case', {
                        authorityId: caseWrapper.case.authorityId,
                        caseId: caseWrapper.case.id,
                      })}
                      case={caseWrapper.case}
                      citizen={caseWrapper.citizen}
                      unprocessedMessages={caseWrapper.unprocessedMessages || 0}
                      assignAction={async () => {
                        // TODO: bind to API
                      }}
                      unassignAction={async () => {
                        await unassignCaseAction(caseWrapper.case.id, caseWrapper.case.agentId as string);
                      }}
                      deleteAction={async () => {
                        await deleteCaseAction(caseWrapper.case);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2">Vous ne traitez actuellement aucun dossier</Typography>
              </Grid>
            )}
            <Grid item xs={12} sx={{ py: 3 }}>
              <Typography component="h2" variant="h6">
                Dossiers clôturés
              </Typography>
            </Grid>
            {closeCasesWrappers.length ? (
              <Grid container component="ul" spacing={3} sx={ulComponentResetStyles}>
                {closeCasesWrappers.map((caseWrapper) => (
                  <Grid key={caseWrapper.case.id} item component="li" xs={12} sm={6}>
                    <CaseCard
                      caseLink={linkRegistry.get('case', {
                        authorityId: caseWrapper.case.authorityId,
                        caseId: caseWrapper.case.id,
                      })}
                      case={caseWrapper.case}
                      citizen={caseWrapper.citizen}
                      unprocessedMessages={caseWrapper.unprocessedMessages || 0}
                      assignAction={async () => {
                        // TODO: bind to API
                      }}
                      unassignAction={async () => {
                        await unassignCaseAction(caseWrapper.case.id, caseWrapper.case.agentId as string);
                      }}
                      deleteAction={async () => {
                        await deleteCaseAction(caseWrapper.case);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2">Vous n&apos;avez aucun dossier assigné ayant été fermé</Typography>
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
