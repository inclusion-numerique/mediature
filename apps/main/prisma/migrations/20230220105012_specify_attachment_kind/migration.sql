/*
  Warnings:

  - Added the required column `kind` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentKind" AS ENUM ('CASE_DOCUMENT', 'AUTHORITY_LOGO', 'MESSAGE_DOCUMENT');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "kind" "AttachmentKind" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING_UPLOAD';
