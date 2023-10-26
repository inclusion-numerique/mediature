import PgBoss from 'pg-boss';

import { prisma } from '@mediature/main/prisma';
import { getServerTranslation } from '@mediature/main/src/i18n';
import { DeleteCaseInboundEmailDataSchema, DeleteCaseInboundEmailDataSchemaType } from '@mediature/main/src/models/jobs/case';
import { getCaseEmail } from '@mediature/main/src/utils/business/case';
import { mailjetClient } from '@mediature/main/src/utils/mailjet';

export const deleteCaseInboundEmailTopic = 'delete-case-inbound-email';

export async function deleteCaseInboundEmail(job: PgBoss.Job<DeleteCaseInboundEmailDataSchemaType>) {
  const data = DeleteCaseInboundEmailDataSchema.parse(job.data);

  const { t } = getServerTranslation('common');
  const caseEmail = getCaseEmail(t, data.caseHumanId.toString()); // Case not longer existing in the database so relying on the event value

  await mailjetClient.deleteInboundEmail(caseEmail);

  console.log(`the inbound email ${caseEmail} dedicated to the case ${data.caseId} has been deleted`);
}
