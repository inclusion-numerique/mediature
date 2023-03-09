import { useColors } from '@codegouvfr/react-dsfr/useColors';
import Button from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Image, { StaticImageData } from 'next/image';
import NextLink from 'next/link';

export interface QuickAccessCardProps {
  image: StaticImageData;
  imageAlt: string;
  text: string;
  link: string;
}

export function QuickAccessCard(props: QuickAccessCardProps) {
  const theme = useColors();

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: '500px',
        bgcolor: '#fff',
        p: 20,
      }}
    >
      <Image
        src={props.image}
        alt={props.imageAlt}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
      <Button component={NextLink} href={props.link} size="large" variant="contained" fullWidth sx={{ mt: 1 }}>
        {props.text}
      </Button>
    </Card>
  );
}
