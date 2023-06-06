import PgBoss from 'pg-boss';

import { prisma } from '@mediature/main/prisma';
import { getServerTranslation } from '@mediature/main/src/i18n';
import { CreateCaseInboundEmailDataSchema, CreateCaseInboundEmailDataSchemaType } from '@mediature/main/src/models/jobs/case';
import { getCaseEmail } from '@mediature/main/src/utils/business/case';
import { mailjetClient } from '@mediature/main/src/utils/mailjet';

export const createCaseInboundEmailTopic = 'create-case-inbound-email';

export async function createCaseInboundEmail(job: PgBoss.Job<CreateCaseInboundEmailDataSchemaType>) {
  const data = CreateCaseInboundEmailDataSchema.parse(job.data);

  const targetedCase = await prisma.case.findUniqueOrThrow({
    where: {
      id: data.caseId,
    },
  });

  const { t } = getServerTranslation('common');

  await mailjetClient.createInboundEmail(getCaseEmail(t, targetedCase.humanId.toString()));

  console.log(`the inbound email has been created for the case ${targetedCase.id}`);
}
