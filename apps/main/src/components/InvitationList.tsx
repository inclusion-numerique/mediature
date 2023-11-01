import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { useSingletonConfirmationDialog } from '@mediature/main/src/components/modal/useModal';
import { InvitationSchemaType } from '@mediature/main/src/models/entities/invitation';
import { nameof } from '@mediature/main/src/utils/typescript';

const typedNameof = nameof<InvitationSchemaType>;

export interface InvitationListProps {
  invitations: InvitationSchemaType[];
}

export function InvitationList({ invitations }: InvitationListProps) {
  const cancelInvitation = trpc.cancelInvitation.useMutation();
  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const cancelInvitationAction = async (invitation: InvitationSchemaType) => {
    showConfirmationDialog({
      description: (
        <>
          Êtes-vous sûr de vouloir annuler l&apos;invitation de{' '}
          <span data-sentry-mask>
            {invitation.inviteeFirstname} {invitation.inviteeLastname}
          </span>{' '}
          ?
        </>
      ),
      onConfirm: async () => {
        await cancelInvitation.mutateAsync({
          invitationId: invitation.id,
        });
      },
    });
  };

  // To type options functions have a look at https://github.com/mui/mui-x/pull/4064
  const columns: GridColDef<InvitationSchemaType>[] = [
    {
      field: typedNameof('inviteeEmail'),
      headerName: 'Email',
      flex: 1.5,
    },
    {
      field: typedNameof('inviteeFirstname'),
      headerName: 'Prénom',
      flex: 1,
    },
    {
      field: typedNameof('inviteeLastname'),
      headerName: 'Nom',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            aria-label="annuler"
            onClick={async () => {
              await cancelInvitationAction(params.row);
            }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <>
      <DataGrid
        rows={invitations}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        autoHeight
        experimentalFeatures={{ newEditingApi: false }}
        disableColumnFilter
        disableColumnMenu
        disableSelectionOnClick
        // loading={false}
        aria-label="liste des invitations en cours"
        data-sentry-mask
      />
    </>
  );
}
