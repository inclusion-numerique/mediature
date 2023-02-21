import { Address, Agent, Attachment, Authority, Case, Citizen, Note, Phone, User } from '@prisma/client';

import { UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { AuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { CaseNoteSchemaType, CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { fileAuthSecret, generateSignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';

export function agentPrismaToModel(
  agent: Agent & {
    user: User;
  }
) {
  return {
    id: agent.id,
    userId: agent.userId,
    authorityId: agent.authorityId,
    firstname: agent.user.firstname,
    lastname: agent.user.lastname,
    email: agent.user.email,
    profilePicture: agent.user.profilePicture,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    deletedAt: agent.deletedAt,
  };
}

export function authorityPrismaToModel(authority: Authority): AuthoritySchemaType {
  return {
    id: authority.id,
    name: authority.name,
    slug: authority.slug,
    mainAgentId: authority.mainAgentId,
    type: authority.type,
    logo: null as string | null, // TODO
    createdAt: authority.createdAt,
    updatedAt: authority.updatedAt,
    deletedAt: authority.deletedAt,
  };
}

export function casePrismaToModel(targetedCase: Case): CaseSchemaType {
  return {
    id: targetedCase.id,
    humanId: targetedCase.humanId,
    citizenId: targetedCase.citizenId,
    authorityId: targetedCase.authorityId,
    agentId: targetedCase.agentId,
    alreadyRequestedInThePast: targetedCase.alreadyRequestedInThePast,
    gotAnswerFromPreviousRequest: targetedCase.gotAnswerFromPreviousRequest,
    description: targetedCase.description,
    units: targetedCase.units,
    emailCopyWanted: targetedCase.emailCopyWanted,
    termReminderAt: targetedCase.termReminderAt,
    initiatedFrom: targetedCase.initiatedFrom,
    status: targetedCase.status,
    closedAt: targetedCase.closedAt,
    finalConclusion: targetedCase.finalConclusion,
    nextRequirements: targetedCase.nextRequirements,
    createdAt: targetedCase.createdAt,
    updatedAt: targetedCase.updatedAt,
    deletedAt: targetedCase.deletedAt,
  };
}

export function citizenPrismaToModel(citizen: Citizen & { address: Address; phone: Phone }): CitizenSchemaType {
  return {
    id: citizen.id,
    email: citizen.email,
    firstname: citizen.firstname,
    lastname: citizen.lastname,
    address: citizen.address,
    phone: citizen.phone,
    createdAt: citizen.createdAt,
    updatedAt: citizen.updatedAt,
    deletedAt: citizen.deletedAt,
  };
}

export function caseNotePrismaToModel(note: Note): CaseNoteSchemaType {
  return {
    id: note.id,
    caseId: note.caseId,
    date: note.date,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    deletedAt: note.deletedAt,
  };
}

export async function attachmentPrismaToModel(attachment: Pick<Attachment, 'id' | 'kind' | 'name'>): Promise<UiAttachmentSchemaType> {
  return {
    id: attachment.id,
    url: await generateSignedAttachmentLink(attachment.id, fileAuthSecret),
  };
}
