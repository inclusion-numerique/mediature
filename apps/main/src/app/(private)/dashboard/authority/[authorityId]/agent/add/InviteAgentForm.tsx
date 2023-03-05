'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { InviteAgentPrefillSchemaType, InviteAgentSchema, InviteAgentSchemaType } from '@mediature/main/src/models/actions/agent';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export function InviteAgentForm({ prefill }: { prefill?: InviteAgentPrefillSchemaType }) {
  const router = useRouter();

  const inviteAgent = trpc.inviteAgent.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<InviteAgentSchemaType>({
    resolver: zodResolver(InviteAgentSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (input: InviteAgentSchemaType) => {
    const result = await inviteAgent.mutateAsync(input);

    if (prefill?.authorityId) {
      router.push(linkRegistry.get('authorityAgentList', { authorityId: prefill.authorityId }));
    }
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="inviter un médiateur">
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
        <Button type="submit" loading={inviteAgent.isLoading} size="large" variant="contained" fullWidth>
          Ajouter / Inviter
        </Button>
      </Grid>
    </BaseForm>
  );
}
