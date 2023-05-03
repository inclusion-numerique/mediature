import addressFormatter from '@fragaria/address-formatter';
import { Link, Text, View } from '@react-pdf/renderer';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { useServerTranslation } from '@mediature/main/src/i18n/index';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { StandardLayout, styles } from '@mediature/ui/src/documents/layouts/StandardLayout';
import { convertInputModelToGooglePhoneNumber } from '@mediature/ui/src/utils/phone';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export interface CaseSynthesisDocumentProps {
  case: CaseSchemaType;
  citizen: CitizenSchemaType;
}

export function CaseSynthesisDocument(props: CaseSynthesisDocumentProps) {
  const { t } = useServerTranslation('common');
  const title = `Synthèse du dossier n°${props.case.humanId.toString()}`;

  // TODO: create generic function for this... or use t() to have translation too?
  const caseEmail = `dossier-${props.case.humanId}@domain.fr`;

  // Display "N/A" when null? --> for email soon

  return (
    <StandardLayout title={title}>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.h2}>Informations générales</Text>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Date de la demande</Text>
          <Text>{t('date.short', { date: props.case.createdAt })}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Mode de saisine</Text>
          <Text>{t(`model.case.platform.enum.${props.case.initiatedFrom}`)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Email du dossier</Text>
          <Text>
            <Link src={`mailto:${caseEmail}`} style={styles.link}>
              {caseEmail}
            </Link>
          </Text>
        </View>
      </View>
      <Text style={styles.h2}>Coordonnées</Text>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Prénom</Text>
          <Text>{props.citizen.firstname}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Nom</Text>
          <Text>{props.citizen.lastname}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Email</Text>
          {!!props.citizen.email ? (
            <Link src={`mailto:${props.citizen.email}`} style={styles.link}>
              {props.citizen.email}
            </Link>
          ) : (
            <Text>-</Text>
          )}
        </View>
        {/* <View style={styles.gridBreak}></View> */}
        <View style={styles.gridItem}>
          <Text style={styles.label}>Adresse</Text>
          <Text>
            {addressFormatter.format({
              street: props.citizen.address.street,
              city: props.citizen.address.city,
              postcode: props.citizen.address.postalCode,
              state: props.citizen.address.subdivision,
              countryCode: props.citizen.address.countryCode,
            })}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Téléphone</Text>
          <Link
            src={phoneNumberUtil.format(convertInputModelToGooglePhoneNumber(props.citizen.phone), PhoneNumberFormat.RFC3966)}
            style={styles.link}
          >
            {phoneNumberUtil.format(convertInputModelToGooglePhoneNumber(props.citizen.phone), PhoneNumberFormat.NATIONAL)}
          </Link>
        </View>
      </View>
      <Text style={styles.h2}>Demande</Text>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Motif de la demande</Text>
          <Text>{props.case.description}</Text>
        </View>
        {/* break */}
        <View style={styles.gridItem}>
          <Text style={styles.label}>Premier recours à l&apos;amiable effectué ?</Text>
          <Text>{props.case.alreadyRequestedInThePast ? t('boolean.true') : t('boolean.false')}</Text>
        </View>
        {props.case.alreadyRequestedInThePast && (
          <View style={styles.gridItem}>
            <Text style={styles.label}>Suite au premier recours, réponse de l&apos;administration reçue ?</Text>
            <Text>{props.case.alreadyRequestedInThePast ? t('boolean.true') : t('boolean.false')}</Text>
          </View>
        )}
      </View>
    </StandardLayout>
  );
}
