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

/**
 * Generic function to handle deleteMany pattern for resources
 * Validates ownership, checks count, and deletes resources
 */
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

  // Find resources to validate ownership
  const resources = await (db[model] as any).findMany({
    where: {
      id: { in: ids },
      userId,
    },
    select: selectMinimal,
  });

  if (resources.length !== ids.length) {
    throwAppError(errorCode, errorMessage);
  }

  // Delete resources
  await (db[model] as any).deleteMany({
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
