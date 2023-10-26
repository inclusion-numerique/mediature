import PgBoss from 'pg-boss';

import { cleanPendingUploads, cleanPendingUploadsTopic } from '@mediature/main/src/server/queueing/workers/clean-pending-uploads';
import { createCaseInboundEmail, createCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/create-case-inbound-email';
import { deleteCaseInboundEmail, deleteCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/delete-case-inbound-email';
import { processInboundMessage, processInboundMessageTopic } from '@mediature/main/src/server/queueing/workers/process-inbound-message';
import { sendAgentsActivitySumUp, sendAgentsActivitySumUpTopic } from '@mediature/main/src/server/queueing/workers/send-agents-activity-sum-up';
import { gracefulExit } from '@mediature/main/src/server/system';

// It appears the PostgreSQL client for `pg-boss` acts differently than the `prisma` ORM one about SSL connection
// For now the only solution we found is to not check certificates because we had the following thrown from `bossClient.start()`:
//
// ```
// > curl http://localhost:$PORT/api/init
// Error: self signed certificate in certificate chain
// at TLSSocket._finishInit (node:_tls_wrap:946:8)
// at TLSSocket.onConnectSecure (node:_tls_wrap:1532:34)
// at TLSWrap.callbackTrampoline (node:internal/async_hooks:130:17) {
// at TLSWrap.ssl.onhandshakedone (node:_tls_wrap:727:12)
// }
// code: 'SELF_SIGNED_CERT_IN_CHAIN'
// at TLSSocket.emit (node:events:527:28)
// Failed to initialize some services
// ```
let databaseUrl = process.env.DATABASE_URL || '';
databaseUrl = databaseUrl.replace('sslmode=prefer', 'sslmode=no-verify');

const bossClient = new PgBoss({
  connectionString: databaseUrl,
  newJobCheckIntervalSeconds: 30, // No need to check every 2 seconds as set by default to look at new jobs
  deleteAfterDays: 14, // Give some time before cleaning archives so an issue can be investigated without dealing with database backups
});

bossClient.on('error', (error) => {
  // Warning: this listener does not seem to work when a worker fails processing a job
  console.error(error);
});

let initPromise: Promise<void> | null = null;

// We force using a singleton getter because if `.start()` is not called before doing any operation it will
// fail silently without doing/throwing anything (we also start listening for events before pushing them)
export async function getBossClientInstance(): Promise<PgBoss> {
  if (!initPromise) {
    initPromise = (async () => {
      await bossClient.start();

      // Bind listeners
      await bossClient.work(cleanPendingUploadsTopic, cleanPendingUploads);
      await bossClient.work(sendAgentsActivitySumUpTopic, sendAgentsActivitySumUp);
      await bossClient.work(createCaseInboundEmailTopic, createCaseInboundEmail);
      await bossClient.work(deleteCaseInboundEmailTopic, deleteCaseInboundEmail);
      await bossClient.work(processInboundMessageTopic, processInboundMessage);
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
