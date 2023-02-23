import { FileKind, mimeData } from 'human-filetypes';

import { AttachmentKindRequirementsSchemaType, AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { bitsFor } from '@mediature/main/src/utils/bits';

export interface AttachmentKindList {
  [key: string]: AttachmentKindRequirementsSchemaType;
}

export const attachmentKindList: AttachmentKindList = {
  [AttachmentKindSchema.Values.CASE_DOCUMENT]: {
    id: AttachmentKindSchema.Values.CASE_DOCUMENT,
    maxSize: 5 * bitsFor.MiB,
    allowedFileTypes: [FileKind.Image, FileKind.Document, FileKind.Spreadsheet, FileKind.Presentation],
    postUploadOperations: null,
    requiresAuthToUpload: false,
    isAttachmentPublic: false,
  },
  [AttachmentKindSchema.Values.AUTHORITY_LOGO]: {
    id: AttachmentKindSchema.Values.AUTHORITY_LOGO,
    maxSize: 750 * bitsFor.KiB,
    allowedFileTypes: [FileKind.Image],
    postUploadOperations: null,
    requiresAuthToUpload: true,
    isAttachmentPublic: true,
  },
  [AttachmentKindSchema.Values.MESSAGE_DOCUMENT]: {
    id: AttachmentKindSchema.Values.MESSAGE_DOCUMENT,
    maxSize: 5 * bitsFor.MiB,
    allowedFileTypes: [FileKind.Image, FileKind.Document, FileKind.Spreadsheet, FileKind.Presentation],
    postUploadOperations: null,
    requiresAuthToUpload: false,
    isAttachmentPublic: false,
  },
};

export function getMimesFromFileKinds(fileKinds: FileKind[]) {
  return Object.entries(mimeData)
    .filter(([mimeTypeKey, mimeTypeObject]) => {
      return fileKinds.includes(mimeTypeObject.kind);
    })
    .map(([mimeTypeKey, mimeTypeObject]) => mimeTypeKey);
}

export function getExtensionsFromFileKinds(fileKinds: FileKind[]) {
  const allExtensions = Object.entries(mimeData)
    .filter(([mimeTypeKey, mimeTypeObject]) => {
      return fileKinds.includes(mimeTypeObject.kind);
    })
    .map(([mimeTypeKey, mimeTypeObject]) => mimeTypeObject.extensions)
    .flat(1);

  return [...new Set(allExtensions)].map((extensionWithDot) => extensionWithDot?.substring(1));
}

export function getExtensionsFromMime(contentType: string): string[] {
  return mimeData[contentType]?.extensions || [];
}

export function getFileKindFromMime(contentType: string): FileKind | null {
  return mimeData[contentType].kind;
}
