/*
  Warnings:

  - The `status` column on the `Attachment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transmitter` column on the `AttachmentsOnCaseNotes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transmitter` column on the `AttachmentsOnCases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING_UPLOAD', 'VALID', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CaseAttachmentType" AS ENUM ('AGENT', 'ADMINISTRATION', 'CITIZEN');

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "status",
ADD COLUMN     "status" "AttachmentStatus" NOT NULL DEFAULT 'VALID';

-- AlterTable
ALTER TABLE "AttachmentsOnCaseNotes" DROP COLUMN "transmitter",
ADD COLUMN     "transmitter" "CaseAttachmentType" NOT NULL DEFAULT 'CITIZEN';

-- AlterTable
ALTER TABLE "AttachmentsOnCases" DROP COLUMN "transmitter",
ADD COLUMN     "transmitter" "CaseAttachmentType" NOT NULL DEFAULT 'CITIZEN';

-- DropEnum
DROP TYPE "AttachementStatus";

-- DropEnum
DROP TYPE "CaseAttachementType";
