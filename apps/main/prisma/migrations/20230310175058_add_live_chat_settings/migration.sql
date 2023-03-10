-- CreateTable
CREATE TABLE "LiveChatSettings" (
    "userId" UUID NOT NULL,
    "sessionToken" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LiveChatSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveChatSettings_sessionToken_key" ON "LiveChatSettings"("sessionToken");

-- AddForeignKey
ALTER TABLE "LiveChatSettings" ADD CONSTRAINT "LiveChatSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
