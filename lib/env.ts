import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
});

const _clientEnv = clientSchema.safeParse(process.env);

if (!_clientEnv.success) {
  console.error(
    '❌ Invalid client environment variables:',
    _clientEnv.error.format(),
  );
  throw new Error('Invalid client environment variables');
}

const isServer = typeof window === 'undefined';
let _serverEnv: ReturnType<typeof serverSchema.safeParse> | null = null;

if (isServer) {
  _serverEnv = serverSchema.safeParse(process.env);
  if (!_serverEnv.success) {
    console.error(
      '❌ Invalid server environment variables:',
      _serverEnv.error.format(),
    );
    throw new Error('Invalid server environment variables');
  }
}

export const env = {
  ..._clientEnv.data,
  ...(isServer && _serverEnv ? _serverEnv.data : {}),
} as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
