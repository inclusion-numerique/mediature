-- DropForeignKey
ALTER TABLE "CaseDomainItem" DROP CONSTRAINT "CaseDomainItem_authorityId_fkey";

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "competent" BOOLEAN,
ADD COLUMN     "competentThirdPartyId" UUID;

-- CreateTable
CREATE TABLE "CaseCompetentThirdPartyItem" (
    "id" UUID NOT NULL,
    "parentItemId" UUID,
    "authorityId" UUID,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CaseCompetentThirdPartyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseCompetentThirdPartyItem_parentItemId_authorityId_name_key" ON "CaseCompetentThirdPartyItem"("parentItemId", "authorityId", "name");

-- AddForeignKey
ALTER TABLE "CaseDomainItem" ADD CONSTRAINT "CaseDomainItem_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseCompetentThirdPartyItem" ADD CONSTRAINT "CaseCompetentThirdPartyItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "CaseCompetentThirdPartyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseCompetentThirdPartyItem" ADD CONSTRAINT "CaseCompetentThirdPartyItem_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_competentThirdPartyId_fkey" FOREIGN KEY ("competentThirdPartyId") REFERENCES "CaseCompetentThirdPartyItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
