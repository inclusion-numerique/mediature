/*
  Warnings:

  - You are about to drop the column `attachmentId` on the `Authority` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdminInvitation" DROP CONSTRAINT "AdminInvitation_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_authorityId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_userId_fkey";

-- DropForeignKey
ALTER TABLE "AgentInvitation" DROP CONSTRAINT "AgentInvitation_authorityId_fkey";

-- DropForeignKey
ALTER TABLE "AgentInvitation" DROP CONSTRAINT "AgentInvitation_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "AgentInvitation" DROP CONSTRAINT "AgentInvitation_userId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentsOnCaseNotes" DROP CONSTRAINT "AttachmentsOnCaseNotes_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentsOnCaseNotes" DROP CONSTRAINT "AttachmentsOnCaseNotes_noteId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentsOnCases" DROP CONSTRAINT "AttachmentsOnCases_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentsOnCases" DROP CONSTRAINT "AttachmentsOnCases_caseId_fkey";

-- DropForeignKey
ALTER TABLE "Authority" DROP CONSTRAINT "Authority_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_issuerId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_caseId_fkey";

-- AlterTable
ALTER TABLE "Authority" DROP COLUMN "attachmentId",
ADD COLUMN     "logoAttachmentId" UUID;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authority" ADD CONSTRAINT "Authority_logoAttachmentId_fkey" FOREIGN KEY ("logoAttachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnCases" ADD CONSTRAINT "AttachmentsOnCases_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnCases" ADD CONSTRAINT "AttachmentsOnCases_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnCaseNotes" ADD CONSTRAINT "AttachmentsOnCaseNotes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnCaseNotes" ADD CONSTRAINT "AttachmentsOnCaseNotes_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
