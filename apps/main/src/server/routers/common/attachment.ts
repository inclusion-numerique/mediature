import { AttachmentStatus } from '@prisma/client';
import getUnixTime from 'date-fns/getUnixTime';
import minutesToSeconds from 'date-fns/minutesToSeconds';
import { diff } from 'fast-array-diff';
import { SignJWT, jwtVerify } from 'jose';
import isJwtTokenExpired from 'jwt-check-expiry';

import { prisma } from '@mediature/main/prisma/client';
import { AttachmentKindSchemaType } from '@mediature/main/src/models/entities/attachment';
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

export interface SafeAttachmentsToProcess {
  markNewAttachmentsAsUsed: () => Promise<void>;
  attachmentsToAdd: string[];
  attachmentsToRemove: string[];
}

export async function formatSafeAttachmentsToProcess(
  attachmentKind: AttachmentKindSchemaType,
  inputAttachmentsIds: string[],
  existingAttachmentsIds: string[]
): Promise<SafeAttachmentsToProcess> {
  // Remove duplicates
  inputAttachmentsIds = [...new Set(inputAttachmentsIds)];
  existingAttachmentsIds = [...new Set(existingAttachmentsIds)];

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
