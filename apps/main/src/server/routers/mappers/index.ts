import { Agent, Authority, Case, Citizen, User } from '@prisma/client';

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

export function authorityPrismaToModel(authority: Authority) {
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

export function casePrismaToModel(targetedCase: Case) {
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

export function citizenPrismaToModel(citizen: Citizen) {
  return {
    id: citizen.id,
    email: citizen.email,
    firstname: citizen.firstname,
    lastname: citizen.lastname,
    addressId: citizen.addressId,
    phoneId: citizen.phoneId,
    createdAt: citizen.createdAt,
    updatedAt: citizen.updatedAt,
    deletedAt: citizen.deletedAt,
  };
}
