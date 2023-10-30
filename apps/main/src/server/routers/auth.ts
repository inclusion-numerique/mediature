import { AgentInvitation } from '@prisma/client';
import bcrypt from 'bcrypt';
import addMinutes from 'date-fns/addMinutes';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { ChangePasswordSchema, RequestNewPasswordSchema, ResetPasswordSchema, SignUpSchema } from '@mediature/main/src/models/actions/auth';
import {
  accountAlreadyWithThisEmailError,
  alreadyUsedInvitationError,
  canceledInvitationError,
  expiredVerificationTokenError,
  invalidCurrentPasswordError,
  invalidInvitationError,
  invalidVerificationTokenError,
  missingInvitationError,
  noAccountWithThisEmailError,
} from '@mediature/main/src/models/entities/errors';
import { InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { UserStatusSchema, VerificationTokenActionSchema } from '@mediature/main/src/models/entities/user';
import { userPrismaToModel } from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export const authRouter = router({
  // Note: `signIn` is managed directly by `next-auth` inside the `authorize()` handler
  signUp: publicProcedure.input(SignUpSchema).mutation(async ({ ctx, input }) => {
    let existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw accountAlreadyWithThisEmailError;
    }

    // Only accept users that have been invited
    if (!input.invitationToken) {
      throw missingInvitationError;
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        inviteeEmail: input.email,
        token: input.invitationToken,
      },
    });

    if (!invitation) {
      throw invalidInvitationError;
    } else if (invitation.status === InvitationStatusSchema.Values.ACCEPTED) {
      throw alreadyUsedInvitationError;
    } else if (invitation.status === InvitationStatusSchema.Values.CANCELED) {
      throw canceledInvitationError;
    }

    const passwordHash = await hashPassword(input.password);

    const createdUser = await prisma.user.create({
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        email: input.email,
        status: UserStatusSchema.Values.CONFIRMED, // "confirmed" directly since we avoid sending an email confirmation, the user has been invited with a token so little chance it's not the right email
        profilePicture: null,
        Secrets: {
          create: {
            passwordHash: passwordHash,
          },
        },
      },
    });

    // Apply the effect of all pending invitations
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        inviteeEmail: input.email,
        status: InvitationStatusSchema.Values.PENDING,
      },
      include: {
        AgentInvitation: true,
        AdminInvitation: true,
      },
    });

    const invitationIds: string[] = [];
    let agentInvitations: AgentInvitation[] = [];
    let setAsAdmin = false;
    for (const pendingInvitation of pendingInvitations) {
      invitationIds.push(pendingInvitation.id);

      if (pendingInvitation.AgentInvitation) {
        agentInvitations.push(pendingInvitation.AgentInvitation);
      }

      if (pendingInvitation.AdminInvitation) {
        setAsAdmin = true;
      }
    }

    // Remove duplicates
    agentInvitations = agentInvitations.filter((x, i, a) => a.indexOf(x) == i);

    // Agent invitations imply linking this new user to authorities
    for (const agentInvitation of agentInvitations) {
      await prisma.agent.create({
        data: {
          user: {
            connect: {
              id: createdUser.id,
            },
          },
          authority: {
            connect: {
              id: agentInvitation.authorityId,
            },
          },
          AuthorityWhereMainAgent: agentInvitation.grantMainAgent
            ? {
                connect: {
                  id: agentInvitation.authorityId,
                },
              }
            : undefined,
        },
      });
    }

    if (setAsAdmin) {
      await prisma.admin.create({
        data: {
          canEverything: true,
          user: {
            connect: {
              id: createdUser.id,
            },
          },
        },
      });
    }

    // Mark all invitations for this email as accepted
    await prisma.invitation.updateMany({
      where: {
        id: {
          in: invitationIds,
        },
      },
      data: {
        status: InvitationStatusSchema.Values.ACCEPTED,
      },
    });

    await mailer.sendSignUpConfirmation({
      recipient: createdUser.email,
      firstname: createdUser.firstname,
      signInUrl: linkRegistry.get('signIn', undefined, { absolute: true }),
    });

    // TODO: exclude hashed password
    return { user: userPrismaToModel(createdUser) };
  }),
  requestNewPassword: publicProcedure.input(RequestNewPasswordSchema).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      throw noAccountWithThisEmailError;
    }

    const durationMinutesToValidateTheToken = 60;
    const expiresAt = addMinutes(new Date(), durationMinutesToValidateTheToken);

    const verificationToken = await prisma.verificationToken.create({
      data: {
        action: VerificationTokenActionSchema.Values.RESET_PASSWORD,
        token: uuidv4(),
        identifier: user.id,
        expires: expiresAt,
      },
    });

    await mailer.sendNewPasswordRequest({
      recipient: user.email,
      firstname: user.firstname,
      resetPasswordUrlWithToken: linkRegistry.get(
        'resetPassword',
        {
          token: verificationToken.token,
        },
        { absolute: true }
      ),
    });

    return;
  }),
  resetPassword: publicProcedure.input(ResetPasswordSchema).mutation(async ({ ctx, input }) => {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        action: VerificationTokenActionSchema.Values.RESET_PASSWORD,
        token: input.token,
      },
    });

    const currentTime = new Date();

    if (!verificationToken) {
      throw invalidVerificationTokenError;
    } else if (verificationToken.expires < currentTime) {
      throw expiredVerificationTokenError;
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.update({
      where: {
        id: verificationToken.identifier,
      },
      data: {
        Secrets: {
          update: {
            passwordHash: hashedPassword,
          },
        },
      },
    });

    // TODO: we could use a status instead of deleting... but we sticked to this table schema coming from Prisma for account management (+ `action` column)
    await prisma.verificationToken.delete({
      where: {
        token: input.token,
      },
    });

    await mailer.sendPasswordReset({
      recipient: user.email,
      firstname: user.firstname,
      signInUrl: linkRegistry.get('signIn', undefined, { absolute: true }),
    });

    return;
  }),
  changePassword: privateProcedure.input(ChangePasswordSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        Secrets: {
          select: {
            passwordHash: true,
          },
        },
      },
    });

    const matchPassword = await bcrypt.compare(input.currentPassword, user.Secrets?.passwordHash || '');
    if (!matchPassword) {
      throw invalidCurrentPasswordError;
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        Secrets: {
          update: {
            passwordHash: newHashedPassword,
          },
        },
      },
    });

    await mailer.sendPasswordChanged({
      recipient: user.email,
      firstname: user.firstname,
    });

    return;
  }),
});
