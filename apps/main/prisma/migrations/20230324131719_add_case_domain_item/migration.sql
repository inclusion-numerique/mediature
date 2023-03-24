-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "domainId" UUID;

-- CreateTable
CREATE TABLE "CaseDomainItem" (
    "id" UUID NOT NULL,
    "parentItemId" UUID,
    "authorityId" UUID,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CaseDomainItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseDomainItem_parentItemId_authorityId_name_key" ON "CaseDomainItem"("parentItemId", "authorityId", "name");

-- AddForeignKey
ALTER TABLE "CaseDomainItem" ADD CONSTRAINT "CaseDomainItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "CaseDomainItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDomainItem" ADD CONSTRAINT "CaseDomainItem_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "CaseDomainItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
