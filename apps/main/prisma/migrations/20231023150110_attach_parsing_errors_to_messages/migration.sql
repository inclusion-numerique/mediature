-- CreateEnum
CREATE TYPE "MessageError" AS ENUM ('REJECTED_ATTACHMENTS');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "errors" "MessageError"[];
