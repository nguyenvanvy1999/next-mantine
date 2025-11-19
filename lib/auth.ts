import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { ac, roles } from '@/lib/auth-access';
import { env } from '@/lib/env';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { adminClient } from 'better-auth/client/plugins';

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  },
});
export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

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
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: 'user',
    }),
    adminClient()
  ],
  trustedOrigins: [env.BETTER_AUTH_URL || 'http://localhost:3000'],
});

export type Session = typeof auth.$Infer.Session;
