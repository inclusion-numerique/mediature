import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Image, { StaticImageData } from 'next/image';
import NextLink from 'next/link';

export interface PartnerProps {
  link: string;
  image: StaticImageData;
  imageAlt: string;
  name: string;
  description: JSX.Element;
  bgcolor?: string;
}

export function Partner(props: PartnerProps) {
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
          columnSpacing={12}
          sx={{
            minHeight: {
              sm: 200,
              md: 300,
            },
          }}
        >
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link
              component={NextLink}
              href={props.link}
              target="_blank"
              underline="none"
              sx={{
                backgroundImage: 'none !important',
                '&::after': {
                  display: 'none !important',
                },
              }}
            >
              <Image
                src={props.image}
                alt={props.imageAlt}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            </Link>
          </Grid>
          <Grid
            item
            xs={12}
            sm={8}
            md={9}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography component="h2" variant="h5" sx={{ width: '100%', mb: 2 }}>
              <Link
                component={NextLink}
                href={props.link}
                target="_blank"
                underline="none"
                sx={{
                  color: 'inherit',
                  width: '100%',
                  mb: 2,
                  '&::after': {
                    display: 'none !important',
                  },
                }}
              >
                {props.name}
              </Link>
            </Typography>
            <Typography variant="body2">{props.description}</Typography>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
