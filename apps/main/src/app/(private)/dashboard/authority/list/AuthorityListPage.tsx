'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Card, CardContent, CircularProgress, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import debounce from 'lodash.debounce';
import NextLink from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { centeredContainerGridProps } from '@mediature/main/src/utils/grid';
import { AuthorityCard } from '@mediature/ui/src/AuthorityCard';
import { LoadingArea } from '@mediature/ui/src/LoadingArea';

export function AuthorityListPage() {
  const queryRef = React.createRef<HTMLInputElement>();
  const [searchQueryManipulated, setSearchQueryManipulated] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data, error, isInitialLoading, isLoading } = trpc.listAuthorities.useQuery({
    orderBy: {},
    filterBy: {
      query: searchQuery,
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

  const authoritiesWrappers = data?.authoritiesWrappers || [];

  if (error) {
    return <span>Error TODO</span>;
  } else if (isInitialLoading && !searchQueryManipulated) {
    return <LoadingArea />;
  }

  const handleClearQuery = () => {
    setSearchQuery(null);

    // We did not bind the TextField to "searchQuery" to allow delaying requests
    if (queryRef.current) {
      queryRef.current.value = '';
    }
  };

  return (
    <>
      <Grid container {...centeredContainerGridProps}>
        <Grid container spacing={1} sx={{ pb: 3 }}>
          <Grid item xs={12} md={7} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              Gérer les collectivités
            </Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <Button component={NextLink} href="/dashboard/authority/create" size="large" variant="contained" startIcon={<AddCircleOutlineIcon />}>
              Ajouter une collectivité
            </Button>
          </Grid>
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
              startAdornment: <InputAdornment position="start">{isLoading ? <CircularProgress size={20} /> : <SearchIcon />}</InputAdornment>,
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
          <Grid container spacing={3}>
            {authoritiesWrappers.map((authorityWrapper) => (
              <Grid key={authorityWrapper.authority.id} item xs={12} sm={6}>
                <AuthorityCard
                  authority={authorityWrapper.authority}
                  mainAgent={authorityWrapper.mainAgent}
                  agents={authorityWrapper.agents}
                  openCases={authorityWrapper.openCases}
                  closeCases={authorityWrapper.closeCases}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <LoadingArea />
        )}
      </Grid>
    </>
  );
}
