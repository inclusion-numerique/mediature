import { RequestCaseSchema } from '@mediature/main/models/actions/case';
import { CasePlatformSchema, CaseStatusSchema } from '@mediature/main/models/entities/case';
import { PhoneTypeSchema } from '@mediature/main/models/entities/phone';
import { prisma } from '@mediature/main/prisma/client';
import { publicProcedure, router } from '@mediature/main/server/trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'OK'),
  requestCase: publicProcedure.input(RequestCaseSchema).mutation(async ({ ctx, input }) => {
    const newCase = await prisma.case.create({
      data: {
        alreadyRequestedInThePast: input.alreadyRequestedInThePast,
        gotAnswerFromPreviousRequest: input.gotAnswerFromPreviousRequest,
        description: input.description,
        units: '',
        emailCopyWanted: input.emailCopyWanted,
        termReminderAt: null,
        initiatedFrom: CasePlatformSchema.Values.WEB,
        status: CaseStatusSchema.Values.TO_PROCESS,
        closedAt: null,
        finalConclusion: null,
        nextRequirements: null,
        citizen: {
          // TODO: get real address/phone from the form
          create: {
            email: input.email,
            firstname: input.firstname,
            lastname: input.lastname,
            address: {
              create: {
                street: '',
                city: '',
                postalCode: '',
                countryCode: '',
                subdivision: '',
              },
            },
            phone: {
              create: {
                phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
                callingCode: '',
                countryCode: '',
                number: '',
              },
            },
          },
        },
      },
    });

    return newCase;
  }),
});

export type AppRouter = typeof appRouter;
