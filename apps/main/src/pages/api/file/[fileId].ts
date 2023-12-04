import { Attachment } from '@prisma/client';
import contentDisposition from 'content-disposition';
import minutesToSeconds from 'date-fns/minutesToSeconds';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

import { prisma } from '@mediature/main/prisma/client';
import {
  fileAccessLinkHasExpiredError,
  fileAccessNotAuthorizedError,
  fileIdMalformatedError,
  fileNotFoundError,
} from '@mediature/main/src/models/entities/errors';
import { verifySignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';
import { fileAuthSecret } from '@mediature/main/src/server/routers/common/attachment.server';
import { apiHandlerWrapper } from '@mediature/main/src/utils/api';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';

export function setCommonFileHeaders(res: NextApiResponse, attachment: Attachment) {
  res.setHeader('Content-Type', attachment.contentType);
  res.setHeader(
    'Content-Disposition',
    contentDisposition(attachment.name || undefined, {
      type: 'inline',
    })
  );
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileId = req.query.fileId;
  const token = req.query.token;

  if (typeof fileId !== 'string') {
    throw fileIdMalformatedError;
  }

  const attachment = await prisma.attachment.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!attachment) {
    throw fileNotFoundError;
  }

  const attachmentKind = attachmentKindList[attachment.kind];

  // [IMPORTANT] Since we manage only tiny files we chose to use our database instead of S3 to keep complexity lite.
  // Postgres cannot manage `bytea` with streams, so it's a full fetch, but we keep using the logic of a stream below
  // in case we switch over Postgres Large Object or S3 in the future (the following helps not blocking other requests)
  const fileContentBuffer = Readable.from(attachment.value);

  await new Promise<void>(async function (resolve, reject) {
    // We set file headers only if we are sure the user is able to display it (otherwise sensitive information could leak)

    if (attachmentKind.isAttachmentPublic) {
      setCommonFileHeaders(res, attachment);
      res.setHeader('Cache-Control', 'public, immutable, no-transform, max-age=0');
    } else {
      const verification = await verifySignedAttachmentLink(fileId, fileAuthSecret, typeof token === 'string' ? token : '');

      if (verification.isExpired) {
        return reject(fileAccessLinkHasExpiredError.cloneWithHttpCode(401));
      } else if (!verification.isVerified) {
        return reject(fileAccessNotAuthorizedError.cloneWithHttpCode(401));
      }

      setCommonFileHeaders(res, attachment);
      res.setHeader('Cache-Control', `private, max-age=${minutesToSeconds(15)}`); // We allow caching for a few minutes even if the link token has expired, we could have set the expiration token time, but it doesn't matter, the platform would have refreshed the link
    }

    fileContentBuffer.pipe(res);
    fileContentBuffer.on('end', resolve);
    fileContentBuffer.on('error', function (err) {
      throw err;
    });
  });
}

export default apiHandlerWrapper(handler);
