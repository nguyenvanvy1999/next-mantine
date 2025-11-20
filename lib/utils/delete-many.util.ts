import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { ErrorCodeType } from './error.util';
import { throwAppError } from './error.util';

export interface DeleteManyConfig {
  db: PrismaClient;
  model:
    | 'account'
    | 'category'
    | 'tag'
    | 'entity'
    | 'event'
    | 'budget'
    | 'goal'
    | 'investment'
    | 'transaction';
  userId: string;
  ids: string[];
  selectMinimal: Record<string, boolean>;
  errorCode: ErrorCodeType;
  errorMessage: string;
  resourceName: string;
}

type PrismaModel = {
  findMany: (args: {
    where: { id: { in: string[] }; userId: string };
    select: Record<string, boolean>;
  }) => Promise<Array<{ id: string }>>;
  deleteMany: (args: {
    where: { id: { in: string[] }; userId: string };
  }) => Promise<{ count: number }>;
};

export async function deleteManyResources(config: DeleteManyConfig): Promise<{
  success: boolean;
  message: string;
}> {
  const {
    db,
    model,
    userId,
    ids,
    selectMinimal,
    errorCode,
    errorMessage,
    resourceName,
  } = config;

  const modelClient = db[model] as unknown as PrismaModel;
  const resources = await modelClient.findMany({
    where: {
      id: { in: ids },
      userId,
    },
    select: selectMinimal,
  });

  if (resources.length !== ids.length) {
    throwAppError(errorCode, errorMessage);
  }

  await modelClient.deleteMany({
    where: {
      id: { in: ids },
      userId,
    },
  });

  return {
    success: true,
    message: `${ids.length} ${resourceName}(s) deleted successfully`,
  };
}
