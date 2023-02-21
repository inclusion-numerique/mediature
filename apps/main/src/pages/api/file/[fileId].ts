import { Attachment } from '@prisma/client';
import contentDisposition from 'content-disposition';
import minutesToSeconds from 'date-fns/minutesToSeconds';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

import { prisma } from '@mediature/main/prisma/client';
import { fileAuthSecret, verifySignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';
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
    const fileContentBuffer = Readable.from(attachment.value);

    await new Promise<void>(async function (resolve) {
      // We set file headers only if we are sure the user is able to display it (otherwise sensitive information could leak)

      if (attachmentKind.isAttachmentPublic) {
        setCommonFileHeaders(res, attachment);
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

        setCommonFileHeaders(res, attachment);
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
