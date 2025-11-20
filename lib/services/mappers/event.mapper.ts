import type { Prisma } from '@/lib/generated/prisma/client';
import {
  dateToIsoString,
  dateToNullableIsoString,
} from '@/lib/utils/formatters';
import type { EventResponse } from '@/types/event';
import type { EVENT_SELECT_FULL } from '../selects';

type EventRecord = Prisma.EventGetPayload<{
  select: typeof EVENT_SELECT_FULL;
}>;

export const mapEvent = (event: EventRecord): EventResponse => ({
  ...event,
  startAt: dateToIsoString(event.startAt),
  endAt: dateToNullableIsoString(event.endAt),
  created: dateToIsoString(event.created),
  modified: dateToIsoString(event.modified),
});
