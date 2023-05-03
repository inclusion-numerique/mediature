import { AttachmentStatus } from '@prisma/client';
import { FileStore } from '@tus/file-store';
import { Server } from '@tus/server';
import fs from 'fs';
import { fromMime } from 'human-filetypes';
import { filetypeinfo } from 'magic-bytes.js';
import mime from 'mime-types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken as nextAuthGetToken } from 'next-auth/jwt';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { nextAuthOptions } from '@mediature/main/src/pages/api/auth/[...nextauth]';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';

// export const uploadSuccessHeaders = {
//   internalMetaId: 'X-Upload-Internal-Meta-Id',
//   internalMetaUrl: 'X-Upload-Internal-Meta-Url',
// };

/**
 * !Important. This will tell Next.js NOT Parse the body as tus requires
 * @see https://nextjs.org/docs/api-routes/request-helpers
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const filesLocalDirectory = path.resolve(__dirname, './.files/');

// There is no `tus` datastore directly uploading to Postgres so we use the local filesystem as a buffer.
// This is totally fine since we don't manage big files (using S3 buckets would imply more cost of complexity and maintenance)
// Ref: https://github.com/tus/tus-node-server/issues/395
const tusServer = new Server({
  // relativeLocation?: boolean;
  // -
  // When deployed and since behind a proxy or load balacancer the original URL scheme is always empty, making Tus returning a `http` upload URL for an `https` initial visit (making the browser complaining)
  // So we tell Tus to look at headers provided by the provider like `X-Forwarded-Proto` to return the right scheme.
  // Ref: https://github.com/transloadit/uppy/issues/2304#issuecomment-638156373
  respectForwardedHeaders: true,
  path: '/api/upload',
  datastore: new FileStore({ directory: filesLocalDirectory }),
  namingFunction(req) {
    // We use an UUID instead of the default crypto hex string to be compatible with our database directly
    // (it's easier for the frontend to manipulate the URL directly while keeping the same UUID before/during/after the upload)
    return uuidv4();
  },
  async onUploadCreate(req, res, upload) {
    // TODO: in case the upload comes from the backend, we should add an authentication check with a custom JWT...

    console.debug('checking pre-create authorization to upload');

    // This function must only be called for "pre-create" hook
    if (req.method !== 'POST') {
      throw { status_code: 500, body: `checking the pre-create hook must be done only at start` };
    }

    // Detect which kind of file is submitted
    // If not a defined one, return error
    const attachmentKindString = upload.metadata?.kind;
    if (!attachmentKindString || attachmentKindString === '') {
      throw { status_code: 500, body: `upload kind metadata must be provided` };
    }

    const attachmentKind = attachmentKindList[attachmentKindString];
    if (!attachmentKind) {
      throw { status_code: 500, body: `upload kind provided does not exist` };
    }

    //
    // The following checks document kind settings
    //

    // Check the size
    if (!upload.size) {
      throw { status_code: 500, body: `internal error` };
    } else if (attachmentKind.maxSize > 0 && attachmentKind.maxSize < upload.size) {
      throw { status_code: 500, body: `the file size is over allowed limit` };
    }

    // Check the file type
    // IMPORTANT: that's just informative since provided by the frontend, a content check must be done after the upload is completed
    const potentialFileType = upload.metadata?.type;
    if (!potentialFileType || potentialFileType == '') {
      throw { status_code: 500, body: `upload file type metadata must be provided` };
    }

    const typeFound = attachmentKind.allowedFileTypes.find((fileType) => {
      return fromMime(potentialFileType) === fileType;
    });
    if (!typeFound) {
      throw { status_code: 500, body: `the file type is not allowed` };
    }

    // Check if the user must be authenticated
    if (attachmentKind.requiresAuthToUpload) {
      const nextjsReq = req as NextApiRequest;
      const token = await nextAuthGetToken({ req: nextjsReq, secret: nextAuthOptions.secret });

      if (!token) {
        throw { status_code: 401, body: `you don't have the rights to upload this kind of file` };
      }
    }

    console.debug('upload authorization granted');

    return res;
  },
  async onUploadFinish(req, res, upload) {
    // TODO: an error in this block responds a 500 HTTP code but Uppy on the frontend still triggers `upload-successs`

    // Mime type check could just use a partial buffer for the file but in all cases uploading to the database cannot be streamed...
    // so we read the file fully
    const attachmentPath = path.resolve(filesLocalDirectory, upload.id);
    const attachmentContent = fs.readFileSync(attachmentPath);

    // Check the file format (bytes) matches the initial mime type
    const types = filetypeinfo(attachmentContent);
    const foundMatchingType = types.find((type) => {
      return type.mime === upload.metadata?.type;
    });

    if (!foundMatchingType) {
      // The file content cannot bring information (it's always the case with CSV files for example)
      // so we rely on a basic local file analysis to give this information, and if not we consider it as valid
      // (there should not be a risk since when serving the file we force as `Content-Type` the one originally allowed)
      const mimeLookup = mime.lookup(attachmentPath); // Returns false if no matching at all

      if (mimeLookup !== upload.metadata?.type && mimeLookup !== false) {
        throw { status_code: 500, body: `the file format does not match the announced MIME type` };
      }
    }

    const attachmentKind = AttachmentKindSchema.parse(upload.metadata?.kind);

    // [IMPORTANT]
    // There is no way to customize the `res` payload, and when setting headers... they cannot be retrieved from Uppy handlers
    // on the frontend. So we decided to use the `tus` generated ID to be used into the database...
    // Also the frontend won't be able to generate the file URL in case this one is protected by a JWT, it will have to use the local path he used until it refreshes the page with data from the API

    // Once uploaded locally we move the file to the database
    const attachment = await prisma.attachment.create({
      data: {
        id: upload.id, // Read above for more information
        kind: attachmentKind,
        contentType: upload.metadata?.type as string,
        value: attachmentContent,
        size: upload.offset,
        name: upload.metadata?.name || '',
        status: AttachmentStatus.PENDING_UPLOAD,
      },
    });

    // // `tus` is not designed so we can modify the payload... otherwise we end with: "Cannot set headers after they are sent to the client"
    // // so we inform the frontend of internal meta through headers
    // res.setHeader(uploadSuccessHeaders.internalMetaId, attachment.id);
    // res.setHeader(uploadSuccessHeaders.internalMetaUrl, `https//TODO.com/${attachment.id}?mysecret=1111`);

    // If uploaded to the database we remove the file locally for security purpose
    // Notes:
    // - files not finished will be erased/lost at the next deployment (the risk is mitigated to be read on disk since incomplete files)
    // - files in the database not submitted through a business form will be removed thanks to a cron job
    fs.unlink(attachmentPath, () => {});

    return res;
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return tusServer.handle(req, res);
}
