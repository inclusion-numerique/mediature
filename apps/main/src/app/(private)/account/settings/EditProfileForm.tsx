'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { UpdateProfilePrefillSchemaType, UpdateProfileSchema, UpdateProfileSchemaType } from '@mediature/main/src/models/actions/user';

export interface EditProfileFormProps {
  email: string;
  prefill?: UpdateProfilePrefillSchemaType;
  onSuccess?: () => void;
}

export function EditProfileForm(props: EditProfileFormProps) {
  const updateProfile = trpc.updateProfile.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      ...props.prefill,
      profilePicture: null,
    },
  });

  const onSubmit = async (input: UpdateProfileSchemaType) => {
    await updateProfile.mutateAsync(input);

    if (props.onSuccess) {
      props.onSuccess();
    }
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="éditer son profil">
      <Grid item xs={12}>
        <TextField
          inputProps={{
            readOnly: true,
          }}
          type="email"
          label="Email"
          value={props.email}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Prénom" {...register('firstname')} error={!!errors.firstname} helperText={errors?.firstname?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField type="lastname" label="Nom" {...register('lastname')} error={!!errors.lastname} helperText={errors?.lastname?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={updateProfile.isLoading} size="large" variant="contained" fullWidth>
          Mettre à jour
        </Button>
      </Grid>
    </BaseForm>
  );
}
