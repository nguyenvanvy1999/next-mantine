import type { ErrorCodeType } from './error.util';
import { throwAppError } from './error.util';
import type { IdUtil } from './id.util';

export function validateResourceOwnership(
  userId: string,
  resourceId: string,
  idUtil: IdUtil,
  errorCode: ErrorCodeType,
  errorMessage: string,
): void {
  const extractedUserId = idUtil.extractUserIdFromId(resourceId);
  if (!extractedUserId || extractedUserId !== userId) {
    throwAppError(errorCode, errorMessage);
  }
}
