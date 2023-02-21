import minutesToSeconds from 'date-fns/minutesToSeconds';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@mediature/main/prisma/client';
import { ReadableString } from '@mediature/main/src/pages/api/file/stream';
import { fileAuthSecret, verifySignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileId = req.query.fileId;
  const token = req.query.token;

  if (typeof fileId !== 'string') {
    throw new Error(`identifiant du fichier malformé`);
  }

  try {
    const attachment = await prisma.attachment.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!attachment) {
      throw new Error(`aucun fichier trouvé`);
    }

    const attachmentKind = attachmentKindList[attachment.kind];

    // [IMPORTANT] Since we manage only tiny files we chose to use our database instead of S3 to keep complexity lite.
    // Postgres cannot manage `bytea` with streams, so it's a full fetch, but we keep using the logic of a stream below
    // in case we switch over Postgres Large Object or S3 in the future (the following helps not blocking other requests)
    const fileContentBuffer = new ReadableString(attachment.contentType);

    await new Promise<void>(async function (resolve) {
      res.setHeader('Content-Type', attachment.contentType);

      if (attachmentKind.isAttachmentPublic) {
        res.setHeader('Cache-Control', 'public, immutable, no-transform, max-age=0');
      } else {
        const verification = await verifySignedAttachmentLink(fileId, fileAuthSecret, typeof token === 'string' ? token : '');

        if (verification.isExpired) {
          res
            .status(401)
            .json({ error: true, message: `le lien pour accéder au fichier a expiré, veuillez retourner sur la plateforme pour y accéder` });
          res.end();
          return resolve();
        } else if (!verification.isVerified) {
          res.status(401).json({ error: true, message: `vous n'êtes pas autorisé à lire ce fichier` });
          res.end();
          return resolve();
        }

        res.setHeader('Cache-Control', `private, max-age=${minutesToSeconds(15)}`); // We allow caching for a few minutes even if the link token has expired, we could have set the expiration token time, but it doesn't matter, the platform would have refreshed the link
      }

      fileContentBuffer.pipe(res);
      fileContentBuffer.on('end', resolve);
      fileContentBuffer.on('error', function (err) {
        res.status(500).json({ error: true, message: 'erreur interne' });
        res.end();
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: true, message: err.message });
      res.end();
    } else {
      res.status(500).json({ error: true, message: 'erreur interne' });
      res.end();
    }
  }
}
