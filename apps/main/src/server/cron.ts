import PgBoss from 'pg-boss';

import { cleanPendingUploads, sendAgentsActivitySumUp } from '@mediature/main/src/server/cron-tasks';

const cleanPendingUploadsTopic = 'clean-pending-uploads';
const sendAgentsActivitySumUpTopic = 'send-agents-activity-sum-up';

export async function initPgBoss(databaseUrl: string) {
  const bossClient = new PgBoss({
    connectionString: databaseUrl,
    newJobCheckIntervalSeconds: 30, // No need to check every 2 seconds as set by default to look at new jobs
  });

  bossClient.on('error', (error) => {
    console.error(error);
  });

  await bossClient.start();

  // Bind listeners
  await bossClient.work(cleanPendingUploadsTopic, cleanPendingUploads);
  await bossClient.work(sendAgentsActivitySumUpTopic, sendAgentsActivitySumUp);

  // Schedule tasks
  await bossClient.schedule(cleanPendingUploadsTopic, `0 3 * * *`, undefined, { tz: 'Europe/Paris' }); // At night to save performance
  await bossClient.schedule(sendAgentsActivitySumUpTopic, `30 7 * * 1-5`, undefined, { tz: 'Europe/Paris' }); // At the beginning of the day except the weekend so agents know what's urgent when starting their day of work

  // Should implement stopping properly in case of a SIGTERM (needed for the rest of the app too)
  // await bossClient.stop({ graceful: true })
}
