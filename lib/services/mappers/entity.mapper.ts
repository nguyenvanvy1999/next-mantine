import type { Prisma } from '@/lib/generated/prisma/client';
import { dateToIsoString } from '@/lib/utils/formatters';
import type { EntityResponse } from '@/types/entity';
import type { ENTITY_SELECT_FULL } from '../selects';

type EntityRecord = Prisma.EntityGetPayload<{
  select: typeof ENTITY_SELECT_FULL;
}>;

export const mapEntity = (entity: EntityRecord): EntityResponse => ({
  ...entity,
  type: entity.type as EntityResponse['type'],
  phone: entity.phone ?? null,
  email: entity.email ?? null,
  address: entity.address ?? null,
  note: entity.note ?? null,
  created: dateToIsoString(entity.created),
  modified: dateToIsoString(entity.modified),
});
