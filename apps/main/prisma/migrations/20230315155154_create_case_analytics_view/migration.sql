-- Create the case analytics view manually since Prisma does not handle view creation for now
-- We use a view so it can be use latter by an external tool like Metabase (we would restrict access to just this view, not the whole database)

CREATE OR REPLACE VIEW "CaseAnalytics" AS
SELECT
    "Case"."humanId" as "humanId",
    "Authority"."id" as "authorityId",
    "Authority"."name" as "authorityName",
    "Authority"."type" as "authorityType",
    "Case"."createdAt" as "createdAt",
    "Case"."updatedAt" as "updatedAt",
    "Case"."closedAt" as "closedAt",
    "Case"."status" as "status",
    "Case"."initiatedFrom" as "initiatedFrom",
    ("Case"."agentId" IS NOT NULL) as "assigned",
    "Case"."alreadyRequestedInThePast" as "alreadyRequestedInThePast",
    "Case"."gotAnswerFromPreviousRequest" as "gotAnswerFromPreviousRequest",
    ("Citizen"."email" IS NOT NULL) as "citizenHasEmail",
    "Address"."city" as "citizenCity",
    "Address"."postalCode" as "citizenPostalCode",
    "Address"."countryCode" as "citizenCountryCode"
FROM "Case"
LEFT JOIN "Authority"
    ON "Case"."authorityId" = "Authority"."id"
LEFT JOIN "Citizen"
    ON "Case"."citizenId" = "Citizen"."id"
LEFT JOIN "Address"
    ON "Citizen"."addressId" = "Address"."id";
