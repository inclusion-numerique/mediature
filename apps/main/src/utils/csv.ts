import type { CaseAnalytics } from '@prisma/client';
import {
  // See Webpack aliases into `@mediature/docs/.storybook/main.js` to understand why we use the browser version at the end even if not optimal
  stringify,
} from 'csv-stringify/browser/esm/sync';

import { getServerTranslation } from '@mediature/main/src/i18n';
import { AuthorityTypeSchemaType } from '@mediature/main/src/models/entities/authority';
import { CasePlatformSchemaType, CaseStatusSchemaType } from '@mediature/main/src/models/entities/case';
import { nameof } from '@mediature/main/src/utils/typescript';

const typedNameof = nameof<CaseAnalytics>;

export function caseAnalyticsPrismaToCsv(analytics: CaseAnalytics[]): string {
  const { t } = getServerTranslation('common');

  const data = stringify(analytics, {
    delimiter: ',',
    header: true,
    columns: [
      { key: typedNameof('humanId'), header: t('document.template.CaseAnalytics.columns.humanId') },
      { key: typedNameof('authorityName'), header: t('document.template.CaseAnalytics.columns.authorityName') },
      { key: typedNameof('authorityType'), header: t('document.template.CaseAnalytics.columns.authorityType') },
      { key: typedNameof('createdAt'), header: t('document.template.CaseAnalytics.columns.createdAt') },
      { key: typedNameof('updatedAt'), header: t('document.template.CaseAnalytics.columns.updatedAt') },
      { key: typedNameof('closedAt'), header: t('document.template.CaseAnalytics.columns.closedAt') },
      { key: typedNameof('status'), header: t('document.template.CaseAnalytics.columns.status') },
      { key: typedNameof('initiatedFrom'), header: t('document.template.CaseAnalytics.columns.initiatedFrom') },
      { key: typedNameof('assigned'), header: t('document.template.CaseAnalytics.columns.assigned') },
      { key: typedNameof('alreadyRequestedInThePast'), header: t('document.template.CaseAnalytics.columns.alreadyRequestedInThePast') },
      { key: typedNameof('gotAnswerFromPreviousRequest'), header: t('document.template.CaseAnalytics.columns.gotAnswerFromPreviousRequest') },
      { key: typedNameof('citizenHasEmail'), header: t('document.template.CaseAnalytics.columns.citizenHasEmail') },
      { key: typedNameof('citizenCity'), header: t('document.template.CaseAnalytics.columns.citizenCity') },
      { key: typedNameof('citizenPostalCode'), header: t('document.template.CaseAnalytics.columns.citizenPostalCode') },
      { key: typedNameof('citizenCountryCode'), header: t('document.template.CaseAnalytics.columns.citizenCountryCode') },
    ],
    cast: {
      boolean: function (value) {
        return value ? t(`document.csv.boolean.true`) : t(`document.csv.boolean.false`);
      },
      date: function (value) {
        // Use a specific format so tools importing the CSV file can autodetect the field and convert it to dates (with all customization the tool allow)
        // (it should respect `YYYY-MM-DD hh:mm:ss`)

        // Note: there is no unified way across tools to inject the timezone into the CSV value so it can be translated when importing
        // the document, so we force the timezone to UTC+1 since there si no reason to be something else for people downloading the file
        return t(`document.csv.date.withTime`, { date: value });
      },
      string: function (value: any, context) {
        if (context.column === typedNameof('authorityType')) {
          return t(`model.authority.type.enum.${value as AuthorityTypeSchemaType}`);
        } else if (context.column === typedNameof('status')) {
          return t(`model.case.status.enum.${value as CaseStatusSchemaType}`);
        } else if (context.column === typedNameof('initiatedFrom')) {
          return t(`model.case.platform.enum.${value as CasePlatformSchemaType}`);
        }

        return value;
      },
    },
  });

  return data;
}
