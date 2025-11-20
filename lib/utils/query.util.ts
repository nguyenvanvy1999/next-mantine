import type { z } from 'zod';

type QuerySource = URL | URLSearchParams | Request | string;

const ensureSearchParams = (source: QuerySource): URLSearchParams => {
  if (source instanceof URLSearchParams) {
    return source;
  }

  if (source instanceof URL) {
    return source.searchParams;
  }

  if (typeof source === 'string') {
    return new URL(source, 'http://localhost').searchParams;
  }

  return new URL(source.url).searchParams;
};

export const parseQueryParams = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  source: QuerySource,
): z.infer<Schema> => {
  const searchParams = ensureSearchParams(source);
  const rawQuery = Object.fromEntries(searchParams.entries());

  return schema.parse(rawQuery);
};
