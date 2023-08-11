/*
  Warnings:

  - The primary key for the `MessagesOnCases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[caseId,messageId]` on the table `MessagesOnCases` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MessagesOnCases_messageId_key";

-- AlterTable
ALTER TABLE "MessagesOnCases" DROP CONSTRAINT "MessagesOnCases_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "MessagesOnCases_caseId_messageId_key" ON "MessagesOnCases"("caseId", "messageId");
