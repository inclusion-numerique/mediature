-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'TRANSFERRED', 'ERROR');

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "fromId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientContactsOnMessages" (
    "recipientId" UUID NOT NULL,
    "messageId" UUID NOT NULL,

    CONSTRAINT "RecipientContactsOnMessages_pkey" PRIMARY KEY ("recipientId","messageId")
);

-- CreateTable
CREATE TABLE "MessagesOnCases" (
    "caseId" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "markedAsProcessed" BOOLEAN,

    CONSTRAINT "MessagesOnCases_pkey" PRIMARY KEY ("caseId","messageId")
);

-- CreateTable
CREATE TABLE "AttachmentsOnMessages" (
    "messageId" UUID NOT NULL,
    "attachmentId" UUID NOT NULL,

    CONSTRAINT "AttachmentsOnMessages_pkey" PRIMARY KEY ("messageId","attachmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_name_key" ON "Contact"("email", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientContactsOnMessages_messageId_key" ON "RecipientContactsOnMessages"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessagesOnCases_messageId_key" ON "MessagesOnCases"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentsOnMessages_attachmentId_key" ON "AttachmentsOnMessages"("attachmentId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientContactsOnMessages" ADD CONSTRAINT "RecipientContactsOnMessages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientContactsOnMessages" ADD CONSTRAINT "RecipientContactsOnMessages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagesOnCases" ADD CONSTRAINT "MessagesOnCases_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagesOnCases" ADD CONSTRAINT "MessagesOnCases_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnMessages" ADD CONSTRAINT "AttachmentsOnMessages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentsOnMessages" ADD CONSTRAINT "AttachmentsOnMessages_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
