-- DropForeignKey
ALTER TABLE "Citizen" DROP CONSTRAINT "Citizen_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Citizen" DROP CONSTRAINT "Citizen_phoneId_fkey";

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
