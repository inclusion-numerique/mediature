import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { PaginationSize } from '@mediature/main/src/models/actions/common';

export const possiblePageSizes: PaginationSize[] = [PaginationSize.size10, PaginationSize.size25, PaginationSize.size50];
export const maxPageSize: PaginationSize = Math.max(...possiblePageSizes);

export interface ListPaginationProps {
  page: number;
  pageSize: PaginationSize;
  totalCount: number;
  itemLabel: (count: number) => string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PaginationSize) => void;
}

export function ListPagination(props: ListPaginationProps) {
  const pagesCount = Math.max(1, Math.ceil(props.totalCount / props.pageSize));

  return (
    <Grid container justifyContent="space-between" alignItems="center" rowSpacing={2} sx={{ mt: 3 }}>
      <Grid item>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {props.itemLabel(props.totalCount)}
          </Typography>
          <TextField
            select
            size="small"
            label="Par page"
            value={props.pageSize}
            onChange={(event) => {
              props.onPageSizeChange(Number(event.target.value) as PaginationSize);
            }}
            sx={{ minWidth: 110 }}
          >
            {possiblePageSizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Grid>
      <Grid item>
        <Pagination
          count={pagesCount}
          page={props.page}
          onChange={(event, pageNumber) => {
            props.onPageChange(pageNumber);
          }}
          color="primary"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          getItemAriaLabel={(type, page) => {
            switch (type) {
              case 'first':
                return 'première page';
              case 'last':
                return 'dernière page';
              case 'previous':
                return 'page précédente';
              case 'next':
                return 'page suivante';
              default:
                return `page ${page}`;
            }
          }}
        />
      </Grid>
    </Grid>
  );
}
