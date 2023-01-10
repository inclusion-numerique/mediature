import { Agent, User } from '@prisma/client';

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
