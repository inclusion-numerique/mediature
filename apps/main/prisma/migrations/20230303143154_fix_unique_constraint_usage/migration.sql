/*
  Warnings:

  - You are about to drop the column `userId` on the `AgentInvitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[attachmentId]` on the table `AttachmentsOnCaseNotes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[attachmentId]` on the table `AttachmentsOnCases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainAgentId]` on the table `Authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoAttachmentId]` on the table `Authority` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AgentInvitation" DROP CONSTRAINT "AgentInvitation_userId_fkey";

-- AlterTable
ALTER TABLE "AgentInvitation" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentsOnCaseNotes_attachmentId_key" ON "AttachmentsOnCaseNotes"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentsOnCases_attachmentId_key" ON "AttachmentsOnCases"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Authority_mainAgentId_key" ON "Authority"("mainAgentId");

-- CreateIndex
CREATE UNIQUE INDEX "Authority_logoAttachmentId_key" ON "Authority"("logoAttachmentId");
