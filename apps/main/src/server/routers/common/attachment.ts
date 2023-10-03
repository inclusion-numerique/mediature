import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import { AttachmentStatus } from '@prisma/client';
import getUnixTime from 'date-fns/getUnixTime';
import minutesToSeconds from 'date-fns/minutesToSeconds';
import { diff } from 'fast-array-diff';
import { SignJWT, jwtVerify } from 'jose';
import isJwtTokenExpired from 'jwt-check-expiry';
import * as tus from 'tus-js-client';

import { prisma } from '@mediature/main/prisma/client';
import { AttachmentKindRequirementsSchemaType, AttachmentKindSchemaType } from '@mediature/main/src/models/entities/attachment';
import { getFileIdFromUrl } from '@mediature/main/src/utils/attachment';
import { bitsFor } from '@mediature/main/src/utils/bits';
import { getListeningPort } from '@mediature/main/src/utils/url';
import { getBaseUrl } from '@mediature/main/src/utils/url';

export const fileAuthSecret = new TextEncoder().encode(process.env.FILE_AUTH_SECRET);

// We use a symetric key since the encode/decode is done in the same program
const algorithm = 'HS256';

export const tokenFileIdClaim = 'urn:claim:file_id';
export const attachmentLinkExpiresIn = minutesToSeconds(15); // Must be less than the validity
export const attachmentLinkModuloIntervalMinutes = 10;

// Round the time to the last X-minute mark
export const getLastModuloTime = () => {
  const currentTime = new Date();
  const d = new Date(currentTime);

  d.setMinutes(Math.floor(d.getMinutes() / attachmentLinkModuloIntervalMinutes) * attachmentLinkModuloIntervalMinutes);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
};

export async function generateSignedAttachmentLink(attachmentId: string, secret: Uint8Array): Promise<string> {
  // Since generating signed URLs for the same attachment will result in different URLs due to expiration time
  // we need to shift a bit the expiration in the past at "a modulo" so some URLs are the same to be cached by the browser
  const lastModuloTimestamp = getUnixTime(getLastModuloTime());

  const jwt = await new SignJWT({ [tokenFileIdClaim]: attachmentId })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt(lastModuloTimestamp)
    .setExpirationTime(lastModuloTimestamp + attachmentLinkExpiresIn)
    .sign(secret);

  const url = new URL(getBaseUrl());
  url.pathname = `/api/file/${attachmentId}`;
  url.searchParams.append('token', jwt);

  return url.toString();
}

export interface SignedAttachmentLinkVerification {
  isVerified: boolean;
  isExpired: boolean;
}

export async function verifySignedAttachmentLink(
  expectedAttachmentId: string,
  secret: Uint8Array,
  token: string
): Promise<SignedAttachmentLinkVerification> {
  try {
    if (isJwtTokenExpired(token)) {
      return {
        isVerified: false,
        isExpired: true,
      };
    }

    const { payload } = await jwtVerify(token, secret);

    if (payload[tokenFileIdClaim] !== expectedAttachmentId) {
      return {
        isVerified: false,
        isExpired: false,
      };
    }

    return {
      isVerified: true,
      isExpired: false,
    };
  } catch (err) {
    return {
      isVerified: false,
      isExpired: false,
    };
  }
}

export interface SafeAttachmentsToProcessOptions {
  maxAttachmentsTotal?: number;
}

export interface SafeAttachmentsToProcess {
  markNewAttachmentsAsUsed: () => Promise<void>;
  attachmentsToAdd: string[];
  attachmentsToRemove: string[];
}

export async function formatSafeAttachmentsToProcess(
  attachmentKind: AttachmentKindSchemaType,
  inputAttachmentsIds: string[],
  existingAttachmentsIds: string[],
  options?: SafeAttachmentsToProcessOptions
): Promise<SafeAttachmentsToProcess> {
  // Remove duplicates
  inputAttachmentsIds = [...new Set(inputAttachmentsIds)];
  existingAttachmentsIds = [...new Set(existingAttachmentsIds)];

  if (options) {
    if (options.maxAttachmentsTotal !== undefined && inputAttachmentsIds.length + existingAttachmentsIds.length > options.maxAttachmentsTotal) {
      throw new Error(`vous ne pouvez pas transmettre plus de fichiers que le nombre autorisé`);
    }
  }

  const { removed, added } = diff(existingAttachmentsIds, inputAttachmentsIds);

  if (added.length) {
    const existingAttachments = await prisma.attachment.findMany({
      where: {
        id: {
          in: inputAttachmentsIds,
        },
        kind: attachmentKind,
        status: AttachmentStatus.PENDING_UPLOAD,
      },
    });

    // If it does not match there are multiple possibilities, all suspicious:
    // - the user tries to bind a different kind of document (maybe to bypass upload restrictions)
    // - the user tries to bind a document already bound, it could be an attempt to "steal" another document by making it visible on the hacker's account
    if (existingAttachments.length !== inputAttachmentsIds.length) {
      throw new Error(`une erreur a été détecté concernant la transmission de documents`);
    }
  }

  return {
    attachmentsToAdd: added,
    attachmentsToRemove: removed,
    markNewAttachmentsAsUsed: added.length
      ? async () => {
          await prisma.attachment.updateMany({
            data: {
              status: AttachmentStatus.VALID,
            },
            where: {
              id: {
                in: added,
              },
            },
          });
        }
      : async () => {},
  };
}

export interface UploadFileOptions {
  filename: string;
  contentType: string;
  kind: AttachmentKindRequirementsSchemaType;
  file: Buffer | NodeJS.ReadableStream;
  fileSize?: number; // In case you pass a stream you must specify the total length of it... but it's hard when generating on the backend without reading the stream for no other reason. So we decided to use `Buffer` in most cases
}

export async function uploadFile(options: UploadFileOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // Since this function is for the server usage librairies will often generate a the Node.js `ReadableStream` or `Buffer`
    // whereas Tus only accepts the browser `ReadableStream` and `Blob`. Casting should be enough in all cases
    const file = options.file as unknown as Blob | ReadableStreamDefaultReader;

    // Reuse the same as for the frontend, it's to limit memory usage in our case
    const chunkSize = 5 * bitsFor.MiB;

    const upload = new tus.Upload(file, {
      endpoint: `http://localhost:${getListeningPort()}/api/upload`, // Use the local address to prevent sending the file over the external network
      chunkSize: chunkSize,
      uploadSize: options.fileSize,
      metadata: {
        name: options.filename,
        type: options.contentType,
        kind: options.kind.id,
      },
      headers: {},
      retryDelays: [1000],
      onError(error) {
        reject(error);

        // Cancel the stream manually (it's done automatically in the `onSuccess`)
        // TODO: but I didn't find for example `pdfStream.destroy()` or `pdfStream.cancel()`...
      },
      onShouldRetry(err, retryAttempt, options) {
        // Prevent retrying
        return false;
      },
      async onSuccess() {
        if (upload.url) {
          const fileId = await getFileIdFromUrl(upload.url);

          resolve(fileId);
        } else {
          reject(new Error('the upload has been a success but no URL was provided'));
        }
      },
    });
    upload.start();
  });
}

export interface UploadPdfFileOptions {
  filename: string;
  kind: AttachmentKindRequirementsSchemaType;
  file: NodeJS.ReadableStream;
}

export async function uploadPdfFile(options: UploadPdfFileOptions): Promise<string> {
  // To upload the PDF we should be aware of its size... which is not possible while having a stream
  // except if we read it once entirely (which looses the sense of a stream).
  // Since they are intended to be tiny, we convert the whole stream into a buffer (the size will be implicit)
  // Note: we didn't used a `string` instead of a stream due to encoding issue (ref: https://github.com/diegomura/react-pdf/issues/1067#issuecomment-1450194954)
  const fileBuffer = await streamToBuffer(options.file);

  return await uploadFile({
    filename: options.filename,
    contentType: 'application/pdf',
    kind: options.kind,
    file: fileBuffer,
  });
}

export interface UploadCsvFileOptions {
  filename: string;
  kind: AttachmentKindRequirementsSchemaType;
  fileContent: string;
}

export async function uploadCsvFile(options: UploadCsvFileOptions): Promise<string> {
  const fileBuffer = Buffer.from(options.fileContent);

  return await uploadFile({
    filename: options.filename,
    contentType: 'text/csv',
    kind: options.kind,
    file: fileBuffer,
  });
}

export interface UploadXlsxFileOptions {
  filename: string;
  kind: AttachmentKindRequirementsSchemaType;
  file: Buffer;
}

export async function uploadXlsxFile(options: UploadXlsxFileOptions): Promise<string> {
  return await uploadFile({
    filename: options.filename,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    kind: options.kind,
    file: options.file,
  });
}
