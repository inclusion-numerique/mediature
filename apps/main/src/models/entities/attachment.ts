import z from 'zod';

export const AttachmentStatusSchema = z.enum(['PENDING_UPLOAD', 'VALID', 'EXPIRED']);
export type AttachmentStatusSchemaType = z.infer<typeof AttachmentStatusSchema>;

export const AttachmentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.string().min(1),
    fileUrl: z.string().url(),
    fileUrlSecret: z.string().min(1),
    size: z.number().int().positive(),
    name: z.string().nullable(),
    status: AttachmentStatusSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AttachmentSchemaType = z.infer<typeof AttachmentSchema>;
