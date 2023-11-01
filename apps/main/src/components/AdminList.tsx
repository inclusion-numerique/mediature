import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import IconButton from '@mui/material/IconButton';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { AdminSchemaType } from '@mediature/main/src/models/entities/admin';
import { nameof } from '@mediature/main/src/utils/typescript';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';

const typedNameof = nameof<AdminSchemaType>;

export interface AdminListProps {
  admins: AdminSchemaType[];
}

export function AdminList({ admins }: AdminListProps) {
  const revokeAdmin = trpc.revokeAdmin.useMutation();
  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const revokeAdminAction = async (admin: AdminSchemaType) => {
    showConfirmationDialog({
      description: (
        <>
          Êtes-vous sûr de vouloir enlever les droits d&apos;administrateur de{' '}
          <span data-sentry-mask>
            {admin.firstname} {admin.lastname}
          </span>{' '}
          ?
        </>
      ),
      onConfirm: async () => {
        await revokeAdmin.mutateAsync({
          userId: admin.userId,
        });
      },
    });
  };

  // To type options functions have a look at https://github.com/mui/mui-x/pull/4064
  const columns: GridColDef<AdminSchemaType>[] = [
    {
      field: typedNameof('email'),
      headerName: 'Email',
      flex: 1.5,
    },
    {
      field: typedNameof('firstname'),
      headerName: 'Prénom',
      flex: 1,
    },
    {
      field: typedNameof('lastname'),
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
            aria-label="enlever les droits"
            onClick={async () => {
              await revokeAdminAction(params.row);
            }}
            size="small"
          >
            <PersonRemoveIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <>
      <DataGrid
        rows={admins}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        autoHeight
        experimentalFeatures={{ newEditingApi: false }}
        disableColumnFilter
        disableColumnMenu
        disableSelectionOnClick
        // loading={false}
        aria-label="liste des administrateurs"
        data-sentry-mask
      />
    </>
  );
}
