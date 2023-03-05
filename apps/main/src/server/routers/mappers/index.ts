import { Address, Admin, Agent, Attachment, Authority, Case, Citizen, Note, Phone, User } from '@prisma/client';

import { UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { AuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { CaseNoteSchemaType, CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { fileAuthSecret, generateSignedAttachmentLink } from '@mediature/main/src/server/routers/common/attachment';

export function adminPrismaToModel(
  admin: Admin & {
    user: User;
  }
) {
  return {
    id: admin.id,
    userId: admin.userId,
    firstname: admin.user.firstname,
    lastname: admin.user.lastname,
    email: admin.user.email,
    profilePicture: admin.user.profilePicture,
    canEverything: admin.canEverything,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    deletedAt: admin.deletedAt,
  };
}

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

export async function authorityPrismaToModel(authority: Authority): Promise<AuthoritySchemaType> {
  return {
    id: authority.id,
    name: authority.name,
    slug: authority.slug,
    mainAgentId: authority.mainAgentId,
    type: authority.type,
    logo: await attachmentIdPrismaToModel(authority.logoAttachmentId),
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

export interface AttachmentPrismaInput {
  id: Attachment['id'];
  contentType?: Attachment['contentType'];
  size?: Attachment['size'];
  name?: Attachment['name'];
}

export async function attachmentPrismaToModel(attachment: AttachmentPrismaInput): Promise<UiAttachmentSchemaType> {
  return {
    id: attachment.id,
    url: await generateSignedAttachmentLink(attachment.id, fileAuthSecret),
    contentType: attachment.contentType,
    size: attachment.size,
    name: attachment.name,
  };
}

export async function attachmentIdPrismaToModel(attachmentId: null): Promise<null>;
export async function attachmentIdPrismaToModel(attachmentId: string): Promise<UiAttachmentSchemaType>;
export async function attachmentIdPrismaToModel(attachmentId: string | null): Promise<UiAttachmentSchemaType | null>;
export async function attachmentIdPrismaToModel(attachmentId: string | null): Promise<UiAttachmentSchemaType | null> {
  if (!attachmentId) {
    return null;
  }

  return await attachmentPrismaToModel({
    id: attachmentId,
  });
}
