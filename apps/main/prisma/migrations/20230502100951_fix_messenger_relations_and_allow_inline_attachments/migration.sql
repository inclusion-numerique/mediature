-- DropIndex
DROP INDEX "RecipientContactsOnMessages_messageId_key";

-- AlterTable
ALTER TABLE "AttachmentsOnMessages" ADD COLUMN     "inline" BOOLEAN NOT NULL DEFAULT false;
