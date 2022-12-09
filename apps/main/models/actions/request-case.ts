import z from 'zod';

import { AddressInputSchema } from '@mediature/main/models/entities/address';
import { CaseSchema } from '@mediature/main/models/entities/case';
import { CitizenSchema } from '@mediature/main/models/entities/citizen';
import { PhoneInputSchema } from '@mediature/main/models/entities/phone';

export const RequestCaseSchema = z
  .object({
    email: CitizenSchema.shape.email,
    firstname: CitizenSchema.shape.firstname,
    lastname: CitizenSchema.shape.lastname,
    // address: AddressInputSchema,
    // phone: PhoneInputSchema,
    // alreadyRequestedInThePast: CaseSchema.shape.alreadyRequestedInThePast,
    // gotAnswerFromPreviousRequest: CaseSchema.shape.gotAnswerFromPreviousRequest,
    description: CaseSchema.shape.description,
    emailCopyWanted: CaseSchema.shape.emailCopyWanted,
    // TODO: attachements
  })
  .required();
// TODO: set strict
// .strict();
export type RequestCaseSchemaType = z.infer<typeof RequestCaseSchema>;
