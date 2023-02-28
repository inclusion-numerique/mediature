import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { PropsWithChildren } from 'react';
import React from 'react';

import { useServerTranslation } from '@mediature/main/src/i18n';
import { getBaseUrl } from '@mediature/main/src/utils/url';

// Between DSFR values and how the PDF library reacts, we need to adjust a bit
const reductionCoefficient = 0.7;

export const styles = StyleSheet.create({
  gridContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    '@media max-width: 400': {
      flexDirection: 'column',
    },
    flexWrap: 'wrap',
    paddingBottom: 20,
    rowGap: 10,
    columnGap: 10,
  },
  gridItem: {
    flexGrow: 1,
    minWidth: '30vw',
  },
  gridBreak: {
    // TODO: breaking to a new line makes "gap" of the container above and below... and we are not able to
    // use negative margin with the PDF library. Gave up for now ;)
    flexBasis: '100%',
    height: 0,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  // Inspired from https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-de-l-identite-de-l-etat/typographie
  // (we tried to reuse "CSS in JS" from the `react-dsfr` but some values are `var(xxx)` so it cannot work, and also having `fontSize` as `rem` unit breaks `fontWeight`... so hardcoding values)
  h1: {
    fontSize: reductionCoefficient * 40,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  h2: {
    fontSize: reductionCoefficient * 32,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  h3: {
    fontSize: reductionCoefficient * 28,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  h4: {
    fontSize: reductionCoefficient * 24,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  h5: {
    fontSize: reductionCoefficient * 22,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  h6: {
    fontSize: reductionCoefficient * 20,
    fontWeight: 700,
    marginBottom: reductionCoefficient * 24,
  },
  p: {
    marginBottom: reductionCoefficient * 24,
  },
  link: {
    color: '#161616',
    textUnderlineOffset: 3, // TODO: not working, it's a bit hard to see underscore for example
  },
});

export const layoutStyles = StyleSheet.create({
  page: {
    fontFamily: 'Marianne',
    padding: '6vw 6vw 6vw 6vw', // Found some models with right padding at `4vw`, but when printing `recto/verso` it could cause issue if attaching pages... so leaving the same for both left and right
    color: '#161616',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: '6vw',
  },
  headerLogo: {
    maxHeight: '12vw',
    objectPosition: 'left center',
    objectFit: 'contain',
  },
  headerDescription: {
    width: '100%',
    textAlign: 'right',
  },
  headerDescriptionLink: {
    color: '#161616', // Force color
    textDecoration: 'none',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    paddingBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    paddingTop: 2,
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fontSize: 12,
    paddingTop: '6vw',
    paddingHorizontal: '9vw',
  },
  footer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: '6vw',
  },
  footerItem: {
    flexBasis: 0,
    flexGrow: 1,
    display: 'flex',
  },
  footerItemText: {
    width: '100%',
    color: '#666',
    fontSize: 8,
  },
  footerItemTextWebsite: {
    textAlign: 'left',
  },
  footerItemTextPageNumber: {
    textAlign: 'center',
  },
  footerItemTextCreatedDate: {
    textAlign: 'right',
  },
});

Font.register({
  family: 'Marianne',
  fonts: [
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Light.woff2`,
      fontWeight: 300,
      fontStyle: 'normal',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Light_Italic.woff2`,
      fontWeight: 300,
      fontStyle: 'italic',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Regular.woff2`,
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Regular_Italic.woff2`,
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Medium.woff2`,
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Medium_Italic.woff2`,
      fontWeight: 500,
      fontStyle: 'italic',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Bold.woff2`,
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Marianne-Bold_Italic.woff2`,
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'Spectral',
  fonts: [
    {
      src: `${getBaseUrl()}/assets/fonts/Spectral-Regular.woff2`,
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: `${getBaseUrl()}/assets/fonts/Spectral-ExtraBold.woff2`,
      fontWeight: 900,
      fontStyle: 'normal',
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]); // Disable hyphenation

export interface StandardLayoutProps {
  title: string;
}

export function StandardLayout(props: PropsWithChildren<StandardLayoutProps>) {
  const { t } = useServerTranslation('common');

  return (
    <Document language="fr-FR" title={props.title} creator="mediature" producer="mediature">
      <Page size="A4" wrap style={layoutStyles.page}>
        <View style={layoutStyles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={`${getBaseUrl()}/assets/images/logo.png`} style={layoutStyles.headerLogo} />
          <View style={layoutStyles.headerDescription}>
            <Link src={getBaseUrl()} style={layoutStyles.headerDescriptionLink}>
              <Text style={layoutStyles.headerTitle}>Médiature</Text>
              <Text style={layoutStyles.headerSubtitle}>Service public de médiation</Text>
            </Link>
          </View>
        </View>
        <View style={layoutStyles.content}>{props.children}</View>
        <View style={layoutStyles.footerSpacer} fixed></View>
        <View
          style={layoutStyles.footer}
          fixed
          render={({ pageNumber }) => {
            return (
              <>
                <View style={layoutStyles.footerItem}>
                  {pageNumber === 1 && (
                    <>
                      {/* <Text style={{ ...layoutStyles.footerItemText, ...layoutStyles.footerItemTextWebsite }}>Généré par {getBaseUrl()}</Text> */}
                    </>
                  )}
                </View>
                <View style={layoutStyles.footerItem}>
                  <Text
                    style={{ ...layoutStyles.footerItemText, ...layoutStyles.footerItemTextPageNumber }}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                  />
                </View>
                <View style={layoutStyles.footerItem}>
                  {pageNumber === 1 && (
                    <Text style={{ ...layoutStyles.footerItemText, ...layoutStyles.footerItemTextCreatedDate }}>
                      {t('date.short', { date: new Date() })}
                    </Text>
                  )}
                </View>
              </>
            );
          }}
        ></View>
      </Page>
    </Document>
  );
}
