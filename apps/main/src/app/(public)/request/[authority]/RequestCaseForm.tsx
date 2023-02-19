'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { RequestCasePrefillSchemaType, RequestCaseSchema, RequestCaseSchemaType } from '@mediature/main/src/models/actions/case';
import { reactHookFormBooleanRadioGroupRegisterOptions } from '@mediature/main/src/utils/form';
import { PhoneField } from '@mediature/ui/src/PhoneField';

export interface RequestCaseFormProps {
  prefill?: RequestCasePrefillSchemaType;
  onSuccess?: () => Promise<void>;
}

export function RequestCaseForm(props: RequestCaseFormProps) {
  const requestCase = trpc.requestCase.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<RequestCaseSchemaType>({
    resolver: zodResolver(RequestCaseSchema),
    defaultValues: props.prefill,
  });

  const onSubmit = async (input: RequestCaseSchemaType) => {
    const result = await requestCase.mutateAsync(input);

    if (props.onSuccess) {
      await props.onSuccess();
    }
  };

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} ariaLabel="déposer une requête">
      <Grid item xs={12} sm={6}>
        <TextField
          label="Prénom"
          placeholder="ex: Marie"
          {...register('firstname')}
          error={!!errors.firstname}
          helperText={errors?.firstname?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nom"
          placeholder="ex: Dupont"
          {...register('lastname')}
          error={!!errors.lastname}
          helperText={errors?.lastname?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Adresse"
          placeholder="20 rue de la ..."
          {...register('address.street')}
          error={!!errors.address?.street}
          helperText={errors?.address?.street?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Code postal"
          placeholder="75000"
          {...register('address.postalCode')}
          error={!!errors.address?.postalCode}
          helperText={errors?.address?.postalCode?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Ville"
          placeholder="Paris"
          {...register('address.city')}
          error={!!errors.address?.city}
          helperText={errors?.address?.city?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <PhoneField
          initialPhoneNumber={props.prefill?.phone}
          onGlobalChange={(phoneNumber) => {
            setValue('phone', phoneNumber);
          }}
          error={!!errors.phone}
          helperText={errors?.phone?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="email"
          label="Email"
          placeholder="ex: marie.dupont@mail.com"
          {...register('email')}
          error={!!errors.email}
          helperText={errors?.email?.message}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl error={!!errors.alreadyRequestedInThePast}>
          <FormHelperText id="previous-request-helper-text">
            Pour que nous puissions au mieux traiter votre demande, veuillez répondre à la question suivante. Nous prendrons en compte votre demande
            peu importe votre réponse.
          </FormHelperText>
          <FormLabel id="previous-request-radio-buttons-group-label">Avez-vous effectué un premier recours à l&apos;amiable ?</FormLabel>
          <RadioGroup
            defaultValue={control._defaultValues.alreadyRequestedInThePast?.toString()}
            onChange={(event) => {
              const value = event.target.value === 'true';

              setValue('alreadyRequestedInThePast', value);

              if (!value) {
                setValue('gotAnswerFromPreviousRequest', null);
              }
            }}
            aria-labelledby="previous-request-radio-buttons-group-label"
            aria-describedby="previous-request-helper-text"
          >
            <FormControlLabel value="true" control={<Radio />} label="Oui, j'ai effectué un premier recours à l'amiable" />
            <FormControlLabel value="false" control={<Radio />} label="Non, je n'ai pas effectué de premier recours à l'amiable" />
          </RadioGroup>
          <FormHelperText>{errors?.alreadyRequestedInThePast?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl disabled={watch('alreadyRequestedInThePast') === false} error={!!errors.gotAnswerFromPreviousRequest}>
          <FormLabel id="answer-from-previous-request--radio-buttons-group-label">
            Suite à ce premier recours à l&apos;amiable, avez-vous reçu une réponse de la part de l&apos;organisme à la charge de votre demande ?
          </FormLabel>
          <RadioGroup
            defaultValue={control._defaultValues.gotAnswerFromPreviousRequest?.toString()}
            onChange={(event) => {
              setValue('gotAnswerFromPreviousRequest', event.target.value === 'true');
            }}
            aria-labelledby="answer-from-previous-request--radio-buttons-group-label"
          >
            <FormControlLabel value="true" control={<Radio />} label="Oui, j'ai obtenu une réponse" />
            <FormControlLabel value="false" control={<Radio />} label="Non, je n'ai pas obtenu de réponse" />
          </RadioGroup>
          <FormHelperText>{errors?.gotAnswerFromPreviousRequest?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Motif de la demande :"
          {...register('description')}
          error={!!errors.description}
          helperText={errors?.description?.message}
          multiline
          rows={3}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl>
          <FormHelperText id="upload-helper-text">
            Si vous avez des documents susceptibles de nous aider, merci de les envoyer en cliquant sur le bouton ci-dessous :{' '}
          </FormHelperText>
          <Button variant="contained" aria-describedby="upload-helper-text">
            {/* TODO: improve + extensions */}
            Joindre un fichier
            <input hidden accept="image/*" multiple type="file" />
          </Button>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl error={!!errors.emailCopyWanted}>
          <FormControlLabel
            label="Envoyez-moi par e-mail une copie de mes réponses."
            control={<Checkbox {...register('emailCopyWanted')} defaultChecked={!!control._defaultValues.emailCopyWanted} />}
          />
          <FormHelperText>{errors?.emailCopyWanted?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={requestCase.isLoading} size="large" variant="contained" fullWidth>
          Envoyer
        </Button>
      </Grid>
    </BaseForm>
  );
}
