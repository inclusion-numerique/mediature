import { Link, Text, View } from '@react-pdf/renderer';

import { useServerTranslation } from '@mediature/main/src/i18n/index';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { StandardLayout, styles } from '@mediature/ui/src/documents/layouts/StandardLayout';

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
          <Link src={`mailto:${props.citizen.email}`} style={styles.link}>
            {props.citizen.email}
          </Link>
        </View>
        {/* <View style={styles.gridBreak}></View> */}
        <View style={styles.gridItem}>
          <Text style={styles.label}>Adresse</Text>
          <Text>{props.citizen.address.street}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Code postal</Text>
          <Text>{props.citizen.address.postalCode}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Ville</Text>
          <Text>{props.citizen.address.city}</Text>
        </View>
        {/* break */}
        <View style={styles.gridItem}>
          <Text style={styles.label}>Téléphone</Text>
          <Text>TODO: set + link to phone?</Text>
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
