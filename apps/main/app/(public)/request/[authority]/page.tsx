'use client';

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function RequestPage({ params: { authority } }: { params: { authority: string } }) {
  return (
    <form>
      <Grid item xs={12}>
        {/* <Image src="https://beta.gouv.fr/img/logo_twitter_image-2019.jpg" width={200} height={100} alt="Logo de la collectivité XXX TODO" /> */}
      </Grid>
      <Grid item xs={12}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Lancer ma démarche de médiation
        </Typography>
      </Grid>
      <Grid container sx={{ maxWidth: 'sm', mx: 'auto' }}>
        <Grid item xs={12} sm={6}>
          {/* <TextField name="firstname" label="Prénom" placeholder="ex: Marie" fullWidth InputLabelProps={{ shrink: true }} /> */}
          <TextField name="firstname" label="Prénom" placeholder="ex: Marie" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="lastname" label="Nom" placeholder="ex: Dupont" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField name="address" label="Adresse" placeholder="ex: 20 rue de la ..." fullWidth />
          {/* TODO: split into multiple components */}
        </Grid>
        <Grid item xs={12}>
          <TextField name="firstname" label="Téléphone" placeholder="ex: 06 66 66 66 66" fullWidth />
          {/* TODO: split into multiple components */}
        </Grid>
        <Grid item xs={12}>
          <TextField type="email" name="email" label="Email" placeholder="ex: marie.dupont@mail.comr=" fullWidth />
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
              aria-labelledby="answer-from-previous-request--radio-buttons-group-label"
            >
              <FormControlLabel value="yes" control={<Radio />} label="Oui, j'ai obtenu une réponse" />
              <FormControlLabel value="no" control={<Radio />} label="Non, je n'ai pas obtenu de réponse" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField name="description" label="Motif de la demande :" multiline rows={3} fullWidth />
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
            <FormControlLabel label="Envoyez-moi par e-mail une copie de mes réponses." control={<Checkbox defaultChecked />} />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            <Button>Envoyer</Button>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
}
