import * as Sentry from '@sentry/nextjs';
import PgBoss from 'pg-boss';

import { dbPool } from '@mediature/main/prisma/pool';
import { BusinessError } from '@mediature/main/src/models/entities/errors';
import { cleanExpiredCases, cleanExpiredCasesTopic } from '@mediature/main/src/server/queueing/workers/clean-expired-cases';
import { cleanPendingUploads, cleanPendingUploadsTopic } from '@mediature/main/src/server/queueing/workers/clean-pending-uploads';
import { createCaseInboundEmail, createCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/create-case-inbound-email';
import { deleteCaseInboundEmail, deleteCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/delete-case-inbound-email';
import { processInboundMessage, processInboundMessageTopic } from '@mediature/main/src/server/queueing/workers/process-inbound-message';
import { sendAgentsActivitySumUp, sendAgentsActivitySumUpTopic } from '@mediature/main/src/server/queueing/workers/send-agents-activity-sum-up';
import { gracefulExit } from '@mediature/main/src/server/system';

const bossClient = new PgBoss({
  db: {
    executeSql: async (text, values) => {
      const result = await dbPool.query(text, values);

      // `pg` types `rowCount` as `number | null`, while pg-boss expects a plain `number`
      return { rows: result.rows, rowCount: result.rowCount ?? 0 };
    },
  },
  newJobCheckIntervalSeconds: 30, // No need to check every 2 seconds as set by default to look at new jobs
  deleteAfterDays: 45, // Give some time before cleaning archives so an issue can be investigated without dealing with database backups
});

bossClient.on('error', (error) => {
  // This error catcher is just for internal operations on pb-boss (fetching, maintenance...)
  // `onComplete` is the proper way to watch job errors
  console.error(error);

  Sentry.captureException(error);
});

let initPromise: Promise<void> | null = null;

// We force using a singleton getter because if `.start()` is not called before doing any operation it will
// fail silently without doing/throwing anything (we also start listening for events before pushing them)
export async function getBossClientInstance(): Promise<PgBoss> {
  if (!initPromise) {
    initPromise = (async () => {
      await bossClient.start();

      // Bind listeners
      await bossClient.work(cleanPendingUploadsTopic, handlerWrapper(cleanPendingUploads));
      await bossClient.work(cleanExpiredCasesTopic, handlerWrapper(cleanExpiredCases));
      await bossClient.work(sendAgentsActivitySumUpTopic, handlerWrapper(sendAgentsActivitySumUp));
      await bossClient.work(createCaseInboundEmailTopic, handlerWrapper(createCaseInboundEmail));
      await bossClient.work(deleteCaseInboundEmailTopic, handlerWrapper(deleteCaseInboundEmail));
      await bossClient.work(processInboundMessageTopic, handlerWrapper(processInboundMessage));
    })();
  }

  // `await` is done outside the condition in case of concurrent init
  try {
    await initPromise;
  } catch (error) {
    gracefulExit(error as unknown as Error);
  }

  return bossClient;
}

export async function stopBossClientInstance(): Promise<void> {
  if (initPromise) {
    await bossClient.stop();
  }
}

export function handlerWrapper<ReqData>(handler: PgBoss.WorkHandler<ReqData>): PgBoss.WorkHandler<ReqData> {
  return async (job: PgBoss.Job<ReqData>) => {
    try {
      await handler(job);
    } catch (error) {
      console.error(error);

      // Wrapping to report error is required since there is no working way to watch job changes easily with `work()` method
      // Ref: https://github.com/timgit/pg-boss/issues/273#issuecomment-1788162895
      if (!(error instanceof BusinessError)) {
        Sentry.withScope(function (scope) {
          // Gather retry errors for the same event at the same place in Sentry
          scope.setFingerprint(['pgboss', job.id]);

          Sentry.captureException(error);
        });
      }

      // Forward the error so pg-boss handles the error correctly
      throw error;
    }
  };
}
