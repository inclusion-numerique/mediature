import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';
import { JobWithMetadata } from 'pg-boss';
import { z } from 'zod';

import { BusinessError } from '@mediature/main/src/models/entities/errors';
import { MaintenanceDataSchemaType, MaintenanceWrapperDataSchema } from '@mediature/main/src/models/jobs/maintenance';
import { getBossClientInstance } from '@mediature/main/src/server/queueing/client';
import { apiHandlerWrapper } from '@mediature/main/src/utils/api';

const maintenanceApiKey = process.env.MAINTENANCE_API_KEY;

export const replayableJobStates: JobWithMetadata['state'][] = ['completed', 'expired', 'cancelled', 'failed'];

export function isAuthenticated(apiKeyHeader?: string): boolean {
  // If the maintenance api key is not defined on the server we prevent executing operations
  return !!maintenanceApiKey && maintenanceApiKey === apiKeyHeader;
}

export const HandlerBodySchema = z
  .object({
    jobId: z.string().uuid(),
  })
  .strict();
export type HandlerBodySchemaType = z.infer<typeof HandlerBodySchema>;

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check the originator has the maintenance secret
  if (!isAuthenticated((req.headers as any)['x-api-key'])) {
    console.log('someone is trying to trigger a job replay without being authenticated');

    throw new createHttpError.Unauthorized(`invalid api key`);
  }

  const body = HandlerBodySchema.parse(req.body);

  const bossClient = await getBossClientInstance();
  const job = await bossClient.getJobById(body.jobId);

  if (!job) {
    throw new BusinessError('jobNotFoundWithId', 'no job found with this id');
  } else if (!replayableJobStates.includes(job.state)) {
    throw new BusinessError('jobCannotBeReplayed', 'the job must be in a final state to be replayed');
  }

  const previousMaintenanceWrapperParse = MaintenanceWrapperDataSchema.parse(job.data);

  let currentMaintenance: MaintenanceDataSchemaType;

  if (previousMaintenanceWrapperParse.__maintenance__) {
    currentMaintenance = {
      requestedAt: new Date(),
      originalJobId: previousMaintenanceWrapperParse.__maintenance__.originalJobId,
      replayedMaintenanceJobId: job.id,
    };
  } else {
    currentMaintenance = {
      requestedAt: new Date(),
      originalJobId: job.id,
    };
  }

  const dataWithMaintenanceMetadata = {
    ...job.data,
    ...MaintenanceWrapperDataSchema.parse({
      __maintenance__: currentMaintenance,
    }),
  };

  const newJobId = await bossClient.send(job.name, dataWithMaintenanceMetadata, {
    // The options are not formatted the same way when getting from the database
    // and as input. So we map manually, but only those that make sense, not the absolute dates...
    expireInMinutes: job.expirein.minutes,
    // Even if the following was undefined when passed, it was triggering the error like `configuration assert: expireInHours must be at least every hour`
    // so only keeping `expireInMinutes` for now
    // ---
    // expireInSeconds: job.expirein.seconds,
    // expireInHours: job.expirein.hours,
    retryLimit: job.retrylimit,
    retryDelay: job.retrydelay,
    retryBackoff: job.retrybackoff,
    onComplete: job.oncomplete !== undefined ? job.oncomplete : (job as any).on_complete, // It seems there is a difference between the type and the real property into the job from the database
  });

  res.send(`The job has been replayed with the id "${newJobId}"`);
}

export default apiHandlerWrapper(handler);
