-- Update the case analytics view manually since Prisma does not handle view update for now
-- (we rewrite the whole query to embed new LEFT JOIN)

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
    "Address"."countryCode" as "citizenCountryCode",
    CASE
        WHEN ("ParentCaseDomainItem"."id" IS NOT NULL) THEN "ParentCaseDomainItem"."name"
        WHEN ("TargetedCaseDomainItem"."id" IS NOT NULL) THEN "TargetedCaseDomainItem"."name"
        ELSE NULL
    END as "primaryDomain",
    CASE
        WHEN ("ParentCaseDomainItem"."id" IS NOT NULL) THEN "TargetedCaseDomainItem"."name"
        ELSE NULL
    END as "secondaryDomain"
FROM "Case"
LEFT JOIN "Authority"
    ON "Case"."authorityId" = "Authority"."id"
LEFT JOIN "Citizen"
    ON "Case"."citizenId" = "Citizen"."id"
LEFT JOIN "Address"
    ON "Citizen"."addressId" = "Address"."id"
LEFT JOIN "CaseDomainItem" as "TargetedCaseDomainItem"
    ON "Case"."domainId" = "TargetedCaseDomainItem"."id"
LEFT JOIN "CaseDomainItem" as "ParentCaseDomainItem"
    ON "TargetedCaseDomainItem"."parentItemId" = "ParentCaseDomainItem"."id";
