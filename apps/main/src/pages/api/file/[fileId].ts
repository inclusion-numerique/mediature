import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@mediature/main/prisma/client';
import { ReadableString } from '@mediature/main/src/pages/api/file/stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileId = req.query.fileId;

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

    // [IMPORTANT] Since we manage only tiny files we chose to use our database instead of S3 to keep complexity lite.
    // Postgres cannot manage `bytea` with streams, so it's a full fetch, but we keep using the logic of a stream below
    // in case we switch over Postgres Large Object or S3 in the future (the following helps not blocking other requests)
    const fileContentBuffer = new ReadableString(attachment.contentType);

    await new Promise(function (resolve) {
      res.setHeader('Content-Type', attachment.contentType);
      res.setHeader('Cache-Control', 'public, immutable, no-transform, max-age=0');

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
