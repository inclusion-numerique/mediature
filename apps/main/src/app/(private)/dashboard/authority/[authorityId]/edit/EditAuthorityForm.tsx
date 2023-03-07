'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { Uploader } from '@mediature/main/src/components/uploader/Uploader';
import { UpdateAuthorityPrefillSchemaType, UpdateAuthoritySchema, UpdateAuthoritySchemaType } from '@mediature/main/src/models/actions/authority';
import { AttachmentKindSchema, UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { AuthorityTypeSchema } from '@mediature/main/src/models/entities/authority';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export const EditAuthorityFormContext = createContext({
  ContextualUploader: Uploader,
});

export interface EditAuthorityFormProps {
  slug: string;
  logo: UiAttachmentSchemaType | null;
  prefill?: UpdateAuthorityPrefillSchemaType;
}

export function EditAuthorityForm(props: EditAuthorityFormProps) {
  const { t } = useTranslation('common');
  const { ContextualUploader } = useContext(EditAuthorityFormContext);
  const router = useRouter();

  const [previewUrl, setPreviewUrl] = useState<string | null>(props.logo?.url || null);

  const updateAuthority = trpc.updateAuthority.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<UpdateAuthoritySchemaType>({
    resolver: zodResolver(UpdateAuthoritySchema),
    defaultValues: props.prefill,
  });

  const onSubmit = async (input: UpdateAuthoritySchemaType) => {
    await updateAuthority.mutateAsync(input);

    router.push(linkRegistry.get('authorityList', undefined));
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="éditer la collectivité">
      <Grid item xs={12}>
        <TextField
          select
          label="Type de collectivité"
          defaultValue={control._defaultValues.type || ''}
          inputProps={register('type')}
          error={!!errors.type}
          helperText={errors.type?.message}
          fullWidth
        >
          {Object.values(AuthorityTypeSchema.Values).map((type) => (
            <MenuItem key={type} value={type}>
              {t(`model.authority.type.enum.${type}`)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField type="name" label="Nom" {...register('name')} error={!!errors.name} helperText={errors?.name?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField
          inputProps={{
            readOnly: true,
          }}
          type="slug"
          label="Identifiant technique (slug)"
          value={props.slug}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Typography
          component="div"
          variant="h6"
          sx={{
            mb: 2,
          }}
        >
          Logo
        </Typography>
        {!!previewUrl ? (
          <Box
            sx={{
              position: 'relative',
              width: 'max-content',
              margin: 'auto',
            }}
          >
            {/* Since base64 image, it does not work with `Image` from Next.js */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="logo de la collectivité"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                maxHeight: '200px',
              }}
            />
            <IconButton
              aria-label="supprimer le logo"
              onClick={() => {
                setPreviewUrl(null);
                setValue('logoAttachmentId', null);
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: '100%',
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <ContextualUploader
            attachmentKindRequirements={attachmentKindList[AttachmentKindSchema.Values.AUTHORITY_LOGO]}
            maxFiles={1}
            onCommittedFilesChanged={async (attachments: UiAttachmentSchemaType[]) => {
              if (attachments[0]) {
                setPreviewUrl(attachments[0].url);
                setValue('logoAttachmentId', attachments[0].id);
              }
            }}
            // TODO: enable once https://github.com/transloadit/uppy/issues/4130#issuecomment-1437198535 is fixed
            // isUploadingChanged={setIsUploadingAttachments}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={updateAuthority.isLoading} size="large" variant="contained" startIcon={<SaveIcon />} fullWidth>
          Sauvegarder
        </Button>
      </Grid>
    </BaseForm>
  );
}
