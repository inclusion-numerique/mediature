import { AgentInvitation } from '@prisma/client';
import bcrypt from 'bcrypt';
import addMinutes from 'date-fns/addMinutes';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { ChangePasswordSchema, RequestNewPasswordSchema, ResetPasswordSchema, SignUpSchema } from '@mediature/main/src/models/actions/auth';
import { InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { UserStatusSchema, VerificationTokenActionSchema } from '@mediature/main/src/models/entities/user';
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
      throw new Error(`un compte est déjà enregistré avec cet email`);
    }

    // Only accept users that have been invited
    if (!input.invitationToken) {
      throw new Error(`vous devez être invité(e) pour créer un compte`);
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        inviteeEmail: input.email,
        token: input.invitationToken,
      },
    });

    if (!invitation) {
      throw new Error(`l'invitation pour vous inscrire est invalide, merci de retenter en cliquant sur le lien envoyé par email`);
    } else if (invitation.status === InvitationStatusSchema.Values.ACCEPTED) {
      throw new Error(`l'invitation avec laquelle vous essayez de vous inscrire a déjà été utilisée`);
    } else if (invitation.status === InvitationStatusSchema.Values.CANCELED) {
      throw new Error(`l'invitation avec laquelle vous essayez de vous inscrire a été annulée`);
    }

    const passwordHash = await hashPassword(input.password);

    const createdUser = await prisma.user.create({
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        email: input.email,
        passwordHash: passwordHash,
        status: UserStatusSchema.Values.CONFIRMED, // "confirmed" directly since we avoid sending an email confirmation, the user has been invited with a token so little chance it's not the right email
        profilePicture: null,
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
    return { createdUser };
  }),
  requestNewPassword: publicProcedure.input(RequestNewPasswordSchema).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      throw new Error(`aucun compte n'existe avec cette adresse email`);
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
      throw new Error(`l'opération que vous essayez de réaliser a été refusée`);
    } else if (verificationToken.expires < currentTime) {
      throw new Error(`vous avez dépassé le temps imparti, merci de renouveler votre demande`);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.update({
      where: {
        id: verificationToken.identifier,
      },
      data: {
        passwordHash: hashedPassword,
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
    const currentHashedPassword = await hashPassword(input.currentPassword);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        passwordHash: currentHashedPassword,
      },
    });

    if (!user) {
      throw new Error(`votre mot de passe actuel que vous venez de rentrer est invalide`);
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newHashedPassword,
      },
    });

    await mailer.sendPasswordChanged({
      recipient: user.email,
      firstname: user.firstname,
    });

    return;
  }),
});
