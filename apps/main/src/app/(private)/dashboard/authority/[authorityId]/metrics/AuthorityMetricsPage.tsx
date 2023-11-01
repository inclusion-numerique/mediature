'use client';

import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { centeredContainerGridProps } from '@mediature/main/src/utils/grid';

export interface AuthorityMetricsPageProps {
  params: { authorityId: string };
}

export function AuthorityMetricsPage({ params: { authorityId } }: AuthorityMetricsPageProps) {
  const generateCsvFromCaseAnalytics = trpc.generateCsvFromCaseAnalytics.useMutation();

  const mainContainerRef = useRef<HTMLDivElement | null>(null); // This is used to scroll to the error messages
  const [pdfGenerationError, setPdfGenerationError] = useState<Error | null>(null);

  const downloadCsv = async () => {
    try {
      const result = await generateCsvFromCaseAnalytics.mutateAsync({
        authorityId: authorityId,
      });

      if (window) {
        window.open(result.attachment.url, '_self');
      }

      setPdfGenerationError(null);
    } catch (err) {
      setPdfGenerationError(err as unknown as Error);
      mainContainerRef.current?.scrollIntoView({ behavior: 'smooth' });

      throw err;
    }
  };

  return (
    <>
      <Grid container {...centeredContainerGridProps} alignContent="flex-start" ref={mainContainerRef}>
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="h1" variant="h5">
            Statistiques de la collectivité
          </Typography>
        </Grid>
        {!!pdfGenerationError && (
          <Grid item xs={12} sx={{ py: 2 }}>
            <ErrorAlert errors={[pdfGenerationError]} />
          </Grid>
        )}
        <Grid item xs={12} sx={{ pb: 3 }}>
          <Typography component="p">
            La plateforme met à votre disposition un condensé des dossiers traités sous format CSV. Les données personnelles susceptibles
            d&apos;identifier une personne ont été supprimées afin que vous puissiez le partager auprès des services de votre collectivité.
          </Typography>
          <Typography component="p" variant="body2" sx={{ fontStyle: 'italic', mt: 2 }}>
            Si vous avez déjà à disposition un document avec des graphiques des années précédentes, le plus simple est d&apos;importer ce nouveau
            fichier CSV dedans afin de ne pas refaire entièrement l&apos;aspect visuel de votre document.
          </Typography>
          <Button
            onClick={downloadCsv}
            loading={generateCsvFromCaseAnalytics.isLoading}
            size="large"
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            Télécharger les statistiques
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
