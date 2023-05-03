import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Image, { StaticImageData } from 'next/image';
import NextLink from 'next/link';

export interface FeatureProps {
  image: StaticImageData;
  imageAlt: string;
  name: string;
  description: JSX.Element;
  bgcolor?: string;
  reverseItems?: boolean;
}

export function Feature(props: FeatureProps) {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        bgcolor: props.bgcolor,
        py: { xs: 3, md: 4 },
      }}
    >
      <Container>
        <Grid
          container
          rowSpacing={4}
          columnSpacing={4}
          sx={{
            minHeight: {
              sm: 300,
              md: 400,
            },
          }}
        >
          <Grid
            item
            xs={12}
            sm={5}
            md={6}
            order={
              props.reverseItems
                ? {
                    xs: 1,
                    sm: 2,
                  }
                : undefined
            }
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              src={props.image}
              alt={props.imageAlt}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={7}
            md={6}
            order={
              props.reverseItems
                ? {
                    xs: 2,
                    sm: 1,
                  }
                : undefined
            }
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography component="h2" variant="h5" sx={{ width: '100%', mb: 2 }}>
              {props.name}
            </Typography>
            <Typography variant="body2">{props.description}</Typography>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
