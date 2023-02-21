import { FileKind } from 'human-filetypes';
import z from 'zod';

import { bitsFor } from '@mediature/main/src/utils/bits';

export const AttachmentStatusSchema = z.enum(['PENDING_UPLOAD', 'VALID', 'EXPIRED']);
export type AttachmentStatusSchemaType = z.infer<typeof AttachmentStatusSchema>;

export const AttachmentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.string().min(1),
    value: z.string(),
    size: z.number().int().positive(),
    name: z.string().nullable(),
    status: AttachmentStatusSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AttachmentSchemaType = z.infer<typeof AttachmentSchema>;

export const UiAttachmentSchema = z
  .object({
    id: AttachmentSchema.shape.id,
    url: z.string().url(),
    contentType: AttachmentSchema.shape.contentType.nullish(),
    size: AttachmentSchema.shape.size.nullish(),
    name: AttachmentSchema.shape.name.nullish(),
  })
  .strict();
export type UiAttachmentSchemaType = z.infer<typeof UiAttachmentSchema>;

export const AttachmentInputSchema = AttachmentSchema.shape.id;
export type AttachmentInputSchemaType = z.infer<typeof AttachmentInputSchema>;

export const AttachmentKindSchema = z.enum(['CASE_DOCUMENT', 'AUTHORITY_LOGO', 'MESSAGE_DOCUMENT']);
export type AttachmentKindSchemaType = z.infer<typeof AttachmentKindSchema>;

export const AttachmentPostUploadOperationSchema = z.enum(['RESIZE', 'COMPRESS']);
export type AttachmentPostUploadOperationSchemaType = z.infer<typeof AttachmentPostUploadOperationSchema>;

export const AttachmentKindRequirementsSchema = z
  .object({
    id: AttachmentKindSchema,
    maxSize: z
      .number()
      .min(0)
      .max(1 * bitsFor.GiB),
    allowedFileTypes: z.array(z.nativeEnum(FileKind)).min(1), // `FileKind`
    postUploadOperations: z.array(AttachmentPostUploadOperationSchema).nullable(),
    requiresAuthToUpload: z.boolean(),
    isAttachmentPublic: z.boolean(),
  })
  .strict();
export type AttachmentKindRequirementsSchemaType = z.infer<typeof AttachmentKindRequirementsSchema>;
