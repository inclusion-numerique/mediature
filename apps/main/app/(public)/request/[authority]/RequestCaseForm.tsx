'use client';

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

export function RequestCaseForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  // For test
  trpc.greeting.useQuery();

  const onSubmit = async (data: any) => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container>
        <Grid item xs={12} sm={6}>
          {/* <TextField name="firstname" label="Prénom" placeholder="ex: Marie" fullWidth InputLabelProps={{ shrink: true }} /> */}
          <TextField name="firstname" label="Prénom" placeholder="ex: Marie" {...register('firstname')} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="lastname" label="Nom" placeholder="ex: Dupont" {...register('lastname')} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField name="address" label="Adresse" placeholder="ex: 20 rue de la ..." {...register('address')} fullWidth />
          {/* TODO: split into multiple components */}
        </Grid>
        <Grid item xs={12}>
          <TextField name="phone" label="Téléphone" placeholder="ex: 06 66 66 66 66" {...register('phone')} fullWidth />
          {/* TODO: split into multiple components */}
        </Grid>
        <Grid item xs={12}>
          <TextField type="email" name="email" label="Email" placeholder="ex: marie.dupont@mail.com" {...register('email')} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            <FormHelperText id="previous-request-helper-text">
              Pour que nous puissions au mieux traiter votre demande, veuillez répondre à la question suivante. Nous prendrons en compte votre demande
              peu importe votre réponse.
            </FormHelperText>
            <FormLabel id="previous-request-radio-buttons-group-label">Avez-vous effectué un premier recours à l&apos;amiable ?</FormLabel>
            <RadioGroup
              name="previous-request-radio-buttons-group"
              {...register('previous-case')}
              aria-labelledby="previous-request-radio-buttons-group-label"
              aria-describedby="previous-request-helper-text"
            >
              <FormControlLabel value="yes" control={<Radio />} label="Oui, j'ai effectué un premier recours à l'amiable" />
              <FormControlLabel value="no" control={<Radio />} label="Non, je n'ai pas effectué de premier recours à l'amiable" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            {/* TODO: if above */}
            <FormLabel id="answer-from-previous-request--radio-buttons-group-label">
              Suite à ce premier recours à l&apos;amiable, avez-vous reçu une réponse de la part de l&apos;organisme à la charge de votre demande ?
            </FormLabel>
            <RadioGroup
              name="answer-from-previous-request-radio-buttons-group"
              {...register('previous-case-answer')}
              aria-labelledby="answer-from-previous-request--radio-buttons-group-label"
            >
              <FormControlLabel value="yes" control={<Radio />} label="Oui, j'ai obtenu une réponse" />
              <FormControlLabel value="no" control={<Radio />} label="Non, je n'ai pas obtenu de réponse" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField name="description" label="Motif de la demande :" {...register('description')} multiline rows={3} fullWidth />
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
          <FormControl>
            <FormControlLabel label="Envoyez-moi par e-mail une copie de mes réponses." control={<Checkbox name="" {...register('send-email')} />} />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            <Button type="submit">Envoyer</Button>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
}
