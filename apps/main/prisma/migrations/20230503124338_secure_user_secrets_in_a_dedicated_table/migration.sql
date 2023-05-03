/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "UserSecrets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserSecrets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSecrets_userId_key" ON "UserSecrets"("userId");

-- AddForeignKey
ALTER TABLE "UserSecrets" ADD CONSTRAINT "UserSecrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MoveData
-- Note: `gen_random_uuid` is specific to PostgreSQL (adjust if you have another database)
INSERT INTO "UserSecrets" ("id", "userId", "passwordHash")
SELECT gen_random_uuid() AS "id", "id" AS "userId", "passwordHash" FROM "User";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";
