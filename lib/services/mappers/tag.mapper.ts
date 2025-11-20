import type { Prisma } from '@/lib/generated/prisma/client';
import { dateToIsoString } from '@/lib/utils/formatters';
import type { TagResponse } from '@/types/tag';
import type { TAG_SELECT_FULL } from '../selects';

type TagRecord = Prisma.TagGetPayload<{
  select: typeof TAG_SELECT_FULL;
}>;

export const mapTag = (tag: TagRecord): TagResponse => ({
  ...tag,
  description: tag.description ?? null,
  created: dateToIsoString(tag.created),
  modified: dateToIsoString(tag.modified),
});
