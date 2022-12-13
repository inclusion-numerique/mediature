import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { TokenUserSchema, TokenUserSchemaType } from '@mediature/main/models/entities/user';
import { prisma } from '@mediature/main/prisma/client';
import { getBaseUrl } from '@mediature/main/utils/url';

// It requires an environment variable always equal to the base URL
process.env.NEXTAUTH_URL = getBaseUrl();

export const nextAuthOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  session: {
    strategy: 'jwt', // TODO: to choose between "jwt" and "database" (if "jwt" at the end, probably adjust the Prisma schema)
  },
  secret: process.env.NEXT_AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-in',
    error: '/auth/sign-in',
    // verifyRequest: '/auth/sign-in',
    newUser: '/auth/sign-up',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Connexion',
      async authorize(credentials: any): Promise<TokenUserSchemaType> {
        if (!credentials.email || !credentials.password) {
          throw new Error('credentials_required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('no_credentials_match');
        }

        const matchPassword = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!matchPassword) {
          throw new Error('no_credentials_match');
        }

        const tokenUserParse = TokenUserSchema.safeParse({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profilePicture: user.profilePicture,
        });

        if (!tokenUserParse.success) {
          throw new Error('cannot_format_token_user');
        }

        return tokenUserParse.data;
      },
      credentials: {
        name: { type: 'test' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          sub: user.id,
          email: user.email,
          given_name: user.firstname,
          family_name: user.lastname,
          picture: user.profilePicture,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        return {
          ...session,
          user: {
            id: token.sub,
            email: token.email,
            firstname: token.given_name,
            lastname: token.family_name,
            profilePicture: token.picture,
          },
        };
      }

      return session;
    },
    async redirect({ url }) {
      const baseUrl = getBaseUrl();

      if (url.startsWith('/')) {
        // Allows relative callback URLs
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        // Allows callback URLs on the same origin
        return url;
      } else {
        // For security reason the default case is to redirect to home
        return baseUrl;
      }
    },
  },
};

export default NextAuth(nextAuthOptions);
