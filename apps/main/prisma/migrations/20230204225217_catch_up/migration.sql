/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeEmail` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeFirstname` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeLastname` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `issuerId` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `AgentInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AgentInvitation` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationId]` on the table `AgentInvitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[citizenId]` on the table `Case` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `Citizen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneId]` on the table `Citizen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorityId` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitationId` to the `AgentInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Authority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorityId` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenAction" AS ENUM ('RESET_PASSWORD');

-- DropForeignKey
ALTER TABLE "AgentInvitation" DROP CONSTRAINT "AgentInvitation_issuerId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_agentId_fkey";

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "authorityId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "AgentInvitation" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "inviteeEmail",
DROP COLUMN "inviteeFirstname",
DROP COLUMN "inviteeLastname",
DROP COLUMN "issuerId",
DROP COLUMN "status",
DROP COLUMN "token",
DROP COLUMN "updatedAt",
ADD COLUMN     "invitationId" UUID NOT NULL,
ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "Authority" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "authorityId" UUID NOT NULL,
ALTER COLUMN "agentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "action" "VerificationTokenAction" NOT NULL;

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "issuerId" UUID NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "inviteeFirstname" TEXT,
    "inviteeLastname" TEXT,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInvitation" (
    "id" UUID NOT NULL,
    "invitationId" UUID NOT NULL,
    "canEverything" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitation_invitationId_key" ON "AdminInvitation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentInvitation_invitationId_key" ON "AgentInvitation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Authority_name_key" ON "Authority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Authority_slug_key" ON "Authority"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Case_citizenId_key" ON "Case"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_addressId_key" ON "Citizen"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_phoneId_key" ON "Citizen"("phoneId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
