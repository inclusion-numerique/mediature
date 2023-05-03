'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
        <FormControl error={!!errors.grantMainAgent}>
          <FormControlLabel
            label={
              <>
                Nommer comme médiateur principal de la collectivité{' '}
                <Typography component="span" sx={{ fontStyle: 'italic' }}>
                  (cela enlèvera les droits du médiateur principal actuel s&apos;il y en a un)
                </Typography>
              </>
            }
            control={<Checkbox {...register('grantMainAgent')} defaultChecked={!!control._defaultValues.grantMainAgent} />}
          />
          <FormHelperText>{errors?.grantMainAgent?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={inviteAgent.isLoading} size="large" variant="contained" fullWidth>
          Ajouter
        </Button>
      </Grid>
    </BaseForm>
  );
}
