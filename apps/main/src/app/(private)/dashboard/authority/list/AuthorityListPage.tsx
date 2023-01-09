'use client';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Card, CardContent, CircularProgress, Grid, IconButton, InputAdornment, Skeleton, TextField, Typography } from '@mui/material';
import debounce from 'lodash.debounce';
import NextLink from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';

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

  const authorities = data?.authorities || [];

  if (error) {
    return <span>Error TODO</span>;
  } else if (isInitialLoading && !searchQueryManipulated) {
    return <span>Loading... TODO template</span>;
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
      <Grid container sx={{ maxWidth: 'md', mx: 'auto' }}>
        <h1>Gérer les collectivités</h1>
        <Button
          component={NextLink}
          href="/dashboard/authority/create"
          size="large"
          sx={{ mt: 3 }}
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
        >
          Ajouter une collectivité
        </Button>
        <Grid item xs={12}>
          <TextField
            type="text"
            name="search"
            label="Search..."
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
          <>
            {authorities.map((authority) => (
              <Grid key={authority.id} item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>{authority.name}</CardContent>
                </Card>
              </Grid>
            ))}
          </>
        ) : (
          <Skeleton />
        )}
      </Grid>
    </>
  );
}
