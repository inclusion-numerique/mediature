'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { InviteAdminPrefillSchemaType, InviteAdminSchema, InviteAdminSchemaType } from '@mediature/main/src/models/actions/admin';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export function InviteAdminForm({ prefill }: { prefill?: InviteAdminPrefillSchemaType }) {
  const router = useRouter();

  const inviteAdmin = trpc.inviteAdmin.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<InviteAdminSchemaType>({
    resolver: zodResolver(InviteAdminSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: InviteAdminSchemaType) => {
    const result = await inviteAdmin.mutateAsync(input);

    router.push(linkRegistry.get('adminList', undefined));
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="inviter un administrateur">
      <Grid item xs={12} sm={6}>
        <TextField
          label="Prénom"
          {...register('inviteeFirstname')}
          error={!!errors.inviteeFirstname}
          helperText={errors?.inviteeFirstname?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nom"
          {...register('inviteeLastname')}
          error={!!errors.inviteeLastname}
          helperText={errors?.inviteeLastname?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="email"
          label="Email"
          {...register('inviteeEmail')}
          error={!!errors.inviteeEmail}
          helperText={errors?.inviteeEmail?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={inviteAdmin.isLoading} size="large" variant="contained" fullWidth>
          Ajouter
        </Button>
      </Grid>
    </BaseForm>
  );
}
