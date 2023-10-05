import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import NextLink from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { CaseSchemaType, CaseWrapperSchemaType } from '@mediature/main/src/models/entities/case';
import { isReminderSoon } from '@mediature/main/src/utils/business/reminder';
import { ListDisplay } from '@mediature/main/src/utils/display';
import { unprocessedMessagesBadgeAttributes } from '@mediature/main/src/utils/dsfr';
import { ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { CaseCard } from '@mediature/ui/src/CaseCard';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';
import { useSingletonConfirmationDialog, useSingletonModal } from '@mediature/ui/src/modal/useModal';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface CaseListProps {
  casesWrappers: CaseWrapperSchemaType[];
  display: ListDisplay;
  canMutate?: boolean;
}

export function CaseList(props: CaseListProps) {
  const { t } = useTranslation('common');

  const unassignCase = trpc.unassignCase.useMutation();
  const deleteCase = trpc.deleteCase.useMutation();
  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuCase, setSelectedMenuCase] = useState<null | CaseSchemaType>(null);

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMenuCase(null);
  };

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

  // To type options functions have a look at https://github.com/mui/mui-x/pull/4064
  const columns: GridColDef<CaseWrapperSchemaType>[] = [
    {
      field: 'caseHumanId',
      headerName: 'N° dossier',
      flex: 1,
      valueGetter: (params) => params.row.case.humanId,
    },
    {
      field: 'requester',
      headerName: 'Requérant',
      flex: 1.5,
      renderCell: (params) => {
        return (
          <Box>
            <Typography component="div" variant="subtitle1" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Link
                component={NextLink}
                href={linkRegistry.get('case', { authorityId: params.row.case.authorityId, caseId: params.row.case.id })}
                color="inherit"
                underline="none"
              >
                {params.row.citizen.firstname} {params.row.citizen.lastname}
              </Link>
              {!!params.row.unprocessedMessages && params.row.unprocessedMessages > 0 && (
                <Badge {...unprocessedMessagesBadgeAttributes} badgeContent={params.row.unprocessedMessages} />
              )}
            </Typography>
            {!!params.row.agent && (
              <Typography component="div" variant="body2">
                Assigné à {params.row.agent.firstname} {params.row.agent.lastname}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'caseStatus',
      headerName: 'Avancement',
      flex: 1,
      renderCell: (params) => {
        return <CaseStatusChip status={params.row.case.status} />;
      },
    },
    {
      field: 'caseTermReminderAt',
      headerName: 'Échéance',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.case.termReminderAt) {
          return null;
        }

        return (
          <Typography component="div" color={isReminderSoon(params.row.case.termReminderAt) ? 'error' : 'primary'}>
            <Grid container direction="row" alignItems="center">
              <AccessTimeIcon sx={{ mr: '5px' }} />
              <span>{t('date.short', { date: params.row.case.termReminderAt })}</span>
            </Grid>
          </Typography>
        );
      },
    },
  ];

  if (props.canMutate) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      renderCell: (params) => {
        const open = Boolean(!!anchorEl && selectedMenuCase === params.row.case);
        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation(); // Needed to not leak to the Card `onClick`

          setAnchorEl(event.currentTarget);
          setSelectedMenuCase(params.row.case);
        };

        return (
          <IconButton
            onClick={handleClick}
            size="small"
            aria-label="options"
            aria-controls={open ? 'case-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon />
          </IconButton>
        );
      },
    });
  }

  return (
    <>
      {props.display === ListDisplay.TABLE ? (
        <DataGrid
          rows={props.casesWrappers}
          getRowId={(row) => row.case.id}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
          experimentalFeatures={{ newEditingApi: false }}
          disableColumnFilter
          disableColumnMenu
          disableSelectionOnClick
          // loading={false}
          sx={{
            '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
              outline: 'none !important', // Remove the outline when focusing any cell
            },
          }}
          aria-label="liste des dossiers"
        />
      ) : (
        <>
          {/* We use "grid+row" as of the DataGrid instead of "ul+li" for stories tests to pass (cannot perform a "or") */}
          <Grid container component="ul" spacing={2} sx={ulComponentResetStyles} aria-label="liste des dossiers">
            {props.casesWrappers.map((caseWrapper) => (
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
                  assignAction={
                    props.canMutate
                      ? async () => {
                          // TODO: bind to API
                        }
                      : undefined
                  }
                  unassignAction={
                    props.canMutate
                      ? async () => {
                          await unassignCaseAction(caseWrapper.case.id, caseWrapper.case.agentId as string);
                        }
                      : undefined
                  }
                  deleteAction={
                    props.canMutate
                      ? async () => {
                          await deleteCaseAction(caseWrapper.case);
                        }
                      : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <Menu
        anchorEl={anchorEl}
        id="case-menu"
        open={!!anchorEl}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ ...menuPaperProps }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!!selectedMenuCase && (
          <>
            {/* TODO: onclick for modal to assign a new one */}
            {/* TODO: disable if the case is already closed? */}
            {/* <MenuItem onClick={props.assignAction}>
            <ListItemIcon>
              <PersonSearchIcon fontSize="small" />
            </ListItemIcon>
            Assigner le dossier à un autre médiateur
          </MenuItem> */}
            <MenuItem
              onClick={async () => {
                await unassignCaseAction(selectedMenuCase.id, selectedMenuCase.agentId as string);
              }}
            >
              <ListItemIcon>
                <PersonRemoveIcon fontSize="small" />
              </ListItemIcon>
              Se désassigner du dossier
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await deleteCaseAction(selectedMenuCase);
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              Supprimer ce dossier
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
