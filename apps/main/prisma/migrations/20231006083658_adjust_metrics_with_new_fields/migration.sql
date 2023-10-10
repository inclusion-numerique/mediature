-- Update the case analytics view manually since Prisma does not handle view update for now
-- (we have to rewrite the whole query... :p)

-- pre-delete is required since "assigned" column has been removed
DROP VIEW "CaseAnalytics";

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
    "Case"."initiatedBy" as "initiatedBy",
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
    END as "secondaryDomain",
    "Case"."outcome" as "outcome",
    "Case"."collectiveAgreement" as "collectiveAgreement",
    "Case"."administrativeCourtNext" as "administrativeCourtNext",
    "Citizen"."genderIdentity" as "citizenGenderIdentity",
    "Case"."termReminderAt" as "termReminderAt",
    "Case"."competent" as "competent",
    CASE
        WHEN ("ParentCaseCompetentThirdPartyItem"."id" IS NOT NULL) THEN "ParentCaseCompetentThirdPartyItem"."name"
        WHEN ("TargetedCaseCompetentThirdPartyItem"."id" IS NOT NULL) THEN "TargetedCaseCompetentThirdPartyItem"."name"
        ELSE NULL
    END as "primaryCompetentThirdParty",
    CASE
        WHEN ("ParentCaseCompetentThirdPartyItem"."id" IS NOT NULL) THEN "TargetedCaseCompetentThirdPartyItem"."name"
        ELSE NULL
    END as "secondaryCompetentThirdParty",
    "Case"."faceToFaceMediation" as "faceToFaceMediation",
    "Citizen"."representation" as "citizenRepresentation",
    CASE
        WHEN ("Case"."agentId" IS NOT NULL) THEN "AgentUser"."firstname" || ' ' || "AgentUser"."lastname"
        ELSE NULL
    END as "assignee"
FROM "Case"
LEFT JOIN "Authority"
    ON "Case"."authorityId" = "Authority"."id"
LEFT JOIN "Agent"
    ON "Case"."agentId" = "Agent"."id"
LEFT JOIN "User" as "AgentUser"
    ON "Agent"."userId" = "AgentUser"."id"
LEFT JOIN "Citizen"
    ON "Case"."citizenId" = "Citizen"."id"
LEFT JOIN "Address"
    ON "Citizen"."addressId" = "Address"."id"
LEFT JOIN "CaseDomainItem" as "TargetedCaseDomainItem"
    ON "Case"."domainId" = "TargetedCaseDomainItem"."id"
LEFT JOIN "CaseDomainItem" as "ParentCaseDomainItem"
    ON "TargetedCaseDomainItem"."parentItemId" = "ParentCaseDomainItem"."id"
LEFT JOIN "CaseCompetentThirdPartyItem" as "TargetedCaseCompetentThirdPartyItem"
    ON "Case"."domainId" = "TargetedCaseCompetentThirdPartyItem"."id"
LEFT JOIN "CaseCompetentThirdPartyItem" as "ParentCaseCompetentThirdPartyItem"
    ON "TargetedCaseCompetentThirdPartyItem"."parentItemId" = "ParentCaseCompetentThirdPartyItem"."id";
