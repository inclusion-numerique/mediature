/*
  Warnings:

  - The values [MAKE_XXX_CALL,SYNC_WITH_CITIZEN,SYNC_WITH_ADMINISTATION,STUCK] on the enum `CaseStatus` will be removed. If these variants are still used in the database, this will fail.

*/

-- We wrap the initial enum switch because it cannot be processed while there is a bound view

BEGIN;
do $$
  declare CaseAnalytics_def text;
begin
  CaseAnalytics_def := (SELECT DEFINITION FROM pg_views WHERE viewname = 'CaseAnalytics');

  DROP VIEW "CaseAnalytics";

  CREATE TYPE "CaseStatus_new" AS ENUM ('TO_PROCESS', 'CONTACT_REQUESTER', 'WAITING_FOR_REQUESTER', 'CONTACT_ADMINISTRATION', 'WAITING_FOR_ADMINISTATION', 'ABOUT_TO_CLOSE', 'CLOSED');
  ALTER TABLE "Case" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");
  ALTER TYPE "CaseStatus" RENAME TO "CaseStatus_old";
  ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";
  DROP TYPE "CaseStatus_old";

  EXECUTE format('CREATE OR REPLACE VIEW "CaseAnalytics" as %s', CaseAnalytics_def);

end $$;
COMMIT;
