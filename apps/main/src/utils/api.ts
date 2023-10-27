import * as Sentry from '@sentry/nextjs';
import createHttpError from 'http-errors';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getToken as nextAuthGetToken } from 'next-auth/jwt';

import { BusinessError, internalServerErrorError } from '@mediature/main/src/models/entities/errors';
import { TokenUserSchema, TokenUserSchemaType } from '@mediature/main/src/models/entities/user';
import { nextAuthOptions } from '@mediature/main/src/pages/api/auth/[...nextauth]';

export type Method = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'PURGE' | 'LINK' | 'UNLINK';

export interface ApiHandlerWrapperOptions {
  restrictMethods?: Method[];
}

export function apiHandlerWrapper(handler: NextApiHandler, options?: ApiHandlerWrapperOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Check method is allowed
      if (options?.restrictMethods && options.restrictMethods.includes(req.method?.toUpperCase() as Method)) {
        throw new createHttpError.MethodNotAllowed();
      }

      await handler(req, res);
    } catch (error) {
      await errorHandler(error, req, res);
    }
  };
}

export async function errorHandler(error: unknown, req: NextApiRequest, res: NextApiResponse) {
  console.error(error);

  if (error instanceof BusinessError) {
    res.status(error.httpCode || 400).json({ error: error.json() });
  } else if (createHttpError.isHttpError(error) && error.expose) {
    // Handle errors thrown with http-errors module
    // (meaning the one throwing wants specific HTTP response, it's kind of a business error but with no translation at the end)
    res.status(error.statusCode).json({ error: { message: error.message } });
  } else {
    const tokenUser = await extractTokenUserFromRequest(req);

    // Notify Sentry of this unexpected error
    Sentry.withScope(function (scope) {
      scope.setUser(tokenUser ? { id: tokenUser.id } : null);

      Sentry.captureException(error);
    });

    res.status(500).json({
      error: internalServerErrorError.json(),
    });
  }
}

export async function extractTokenUserFromRequest(req: NextApiRequest): Promise<TokenUserSchemaType | null> {
  const token = await nextAuthGetToken({ req: req, secret: nextAuthOptions.secret });

  const result = TokenUserSchema.safeParse(token);

  if (result.success) {
    return result.data;
  }

  return null;
}
