import { getBossClientInstance } from '@mediature/main/src/server/queueing/client';
import { cleanPendingUploadsTopic } from '@mediature/main/src/server/queueing/workers/clean-pending-uploads';
import { sendAgentsActivitySumUpTopic } from '@mediature/main/src/server/queueing/workers/send-agents-activity-sum-up';

export async function scheduleCronTasks() {
  const bossClient = await getBossClientInstance();

  // Schedule tasks
  await bossClient.schedule(cleanPendingUploadsTopic, `0 3 * * *`, undefined, { tz: 'Europe/Paris' }); // At night to save performance
  await bossClient.schedule(sendAgentsActivitySumUpTopic, `30 7 * * 1-5`, undefined, { tz: 'Europe/Paris' }); // At the beginning of the day except the weekend so agents know what's urgent when starting their day of work
}
