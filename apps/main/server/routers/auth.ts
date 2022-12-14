import bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { ChangePasswordSchema, RequestNewPasswordSchema, ResetPasswordSchema, SignUpSchema } from '@mediature/main/models/actions/auth';
import { InvitationStatusSchema } from '@mediature/main/models/entities/invitation';
import { UserStatusSchema, VerificationTokenActionSchema } from '@mediature/main/models/entities/user';
import { prisma } from '@mediature/main/prisma/client';
import { privateProcedure, publicProcedure, router } from '@mediature/main/server/trpc';

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
    let authorityIdsToJoin: string[] = [];
    let setAsAdmin = false;
    for (const pendingInvitation of pendingInvitations) {
      invitationIds.push(pendingInvitation.id);

      authorityIdsToJoin.push(
        ...pendingInvitation.AgentInvitation.map((agentInvitation) => {
          return agentInvitation.authorityId;
        })
      );

      if (pendingInvitation.AdminInvitation.length > 0) {
        setAsAdmin = true;
      }
    }

    // Remove duplicates
    authorityIdsToJoin = authorityIdsToJoin.filter((x, i, a) => a.indexOf(x) == i);

    // Agent invitations imply linking this new user to authorities
    for (const authorityIdToJoin of authorityIdsToJoin) {
      await prisma.agent.create({
        data: {
          user: {
            connect: {
              id: createdUser.id,
            },
          },
          authority: {
            connect: {
              id: authorityIdToJoin,
            },
          },
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

    // TODO: send email for confirmation

    // TODO: exclude hashed password
    return { createdUser };
  }),
  requestNewPassword: privateProcedure.input(RequestNewPasswordSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error(`aucun compte n'existe avec cette adresse email`);
    }

    const durationMinutesToValidateTheToken = 60;
    const expiresAt = addMinutes(new Date(), durationMinutesToValidateTheToken);

    await prisma.verificationToken.create({
      data: {
        action: VerificationTokenActionSchema.Values.RESET_PASSWORD,
        token: uuidv4(),
        identifier: userId,
        expires: expiresAt,
      },
    });

    // TODO: send email for reset

    return;
  }),
  resetPassword: privateProcedure.input(ResetPasswordSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        action: VerificationTokenActionSchema.Values.RESET_PASSWORD,
        token: input.token,
        identifier: userId,
      },
    });

    const currentTime = new Date();

    if (!verificationToken) {
      throw new Error(`l'opération que vous essayez de réaliser a été refusée`);
    } else if (verificationToken.expires < currentTime) {
      throw new Error(`vous avez dépassé le temps imparti, merci de renouveler votre demande`);
    }

    const hashedPassword = await hashPassword(input.password);

    await prisma.user.update({
      where: {
        id: userId,
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

    // TODO: send email for pwd change confirmation

    return;
  }),
});
