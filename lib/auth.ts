import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  session: {
    expiresIn: 60 * 60, // 1 hour in seconds
    updateAge: 60 * 5, // Update session every 5 minutes
  },
  user: {
    additionalFields: {
      permissions: {
        type: 'string[]',
        required: false,
        defaultValue: [],
      },
      roles: {
        type: 'string[]',
        required: false,
        defaultValue: [],
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
});

export type Session = typeof auth.$Infer.Session;
