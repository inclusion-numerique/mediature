'use client';

import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/client/trpcClient';
import { RequestCaseSchema, RequestCaseSchemaType } from '@mediature/main/models/actions/request-case';

export function RequestCaseForm() {
  const requestCase = trpc.requestCase.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RequestCaseSchemaType>({
    resolver: zodResolver(RequestCaseSchema),
  });

  const onSubmit = async (input: RequestCaseSchemaType) => {
    await requestCase.mutateAsync(input);
  };

  return (
    <>
      {/* <DevTool control={control} /> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container>
          <Grid item xs={12} sm={6}>
            {/* <TextField name="firstname" label="Prénom" placeholder="ex: Marie" fullWidth InputLabelProps={{ shrink: true }} /> */}
            <TextField
              name="firstname"
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
              name="lastname"
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
              name="address"
              label="Adresse"
              placeholder="ex: 20 rue de la ..."
              {...register('address')}
              error={!!errors.address}
              helperText={errors?.address?.message}
              fullWidth
            />
            {/* TODO: split into multiple components */}
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="phone"
              label="Téléphone"
              placeholder="ex: 06 66 66 66 66"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors?.phone?.message}
              fullWidth
            />
            {/* TODO: split into multiple components */}
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="email"
              name="email"
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
                Pour que nous puissions au mieux traiter votre demande, veuillez répondre à la question suivante. Nous prendrons en compte votre
                demande peu importe votre réponse.
              </FormHelperText>
              <FormLabel id="previous-request-radio-buttons-group-label">Avez-vous effectué un premier recours à l&apos;amiable ?</FormLabel>
              <RadioGroup
                name="previous-request-radio-buttons-group"
                aria-labelledby="previous-request-radio-buttons-group-label"
                aria-describedby="previous-request-helper-text"
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  {...register('alreadyRequestedInThePast')}
                  label="Oui, j'ai effectué un premier recours à l'amiable"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  {...register('alreadyRequestedInThePast')}
                  label="Non, je n'ai pas effectué de premier recours à l'amiable"
                />
              </RadioGroup>
              <FormHelperText>{errors?.alreadyRequestedInThePast?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl error={!!errors.gotAnswerFromPreviousRequest}>
              {/* TODO: if above */}
              <FormLabel id="answer-from-previous-request--radio-buttons-group-label">
                Suite à ce premier recours à l&apos;amiable, avez-vous reçu une réponse de la part de l&apos;organisme à la charge de votre demande ?
              </FormLabel>
              <RadioGroup
                name="answer-from-previous-request-radio-buttons-group"
                aria-labelledby="answer-from-previous-request--radio-buttons-group-label"
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  {...register('gotAnswerFromPreviousRequest')}
                  label="Oui, j'ai obtenu une réponse"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  {...register('gotAnswerFromPreviousRequest')}
                  label="Non, je n'ai pas obtenu de réponse"
                />
              </RadioGroup>
              <FormHelperText>{errors?.gotAnswerFromPreviousRequest?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
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
              <Button variant="contained" component="label" aria-describedby="upload-helper-text">
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
                control={<Checkbox name="" {...register('emailCopyWanted')} />}
              />
              <FormHelperText>{errors?.emailCopyWanted?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <Button type="submit">Envoyer</Button>
            </FormControl>
          </Grid>
        </Grid>
      </form>
    </>
  );
}