-- CreateEnum
CREATE TYPE "CitizenRepresentation" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'PUBLIC_INSTITUTION', 'AUTHORITY', 'ASSOCIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseOriginator" AS ENUM ('CITIZEN', 'ADMINISTRATIVE_COURT', 'INTERNAL_DEPARTMENT', 'AUTHORITY_REPRESENTATIVE', 'RIGHTS_DEFENDER', 'AGENT', 'OTHER');

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "initiatedBy" "CaseOriginator";

-- AlterTable
ALTER TABLE "Citizen" ADD COLUMN     "representation" "CitizenRepresentation";
