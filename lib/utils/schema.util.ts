import { z } from 'zod';

const baseSortOrders = ['asc', 'desc'] as const;

export const paginationParams = {
  page: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().optional(),
};

export const sortOrderParam = {
  sortOrder: z.enum(baseSortOrders).optional(),
};

export const createSortByParam = <
  const T extends readonly [string, ...string[]],
>(
  options: T,
) => ({
  sortBy: z.enum(options).optional(),
});

const toCommaSeparatedArray = (value: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const commaSeparatedParam = <Schema extends z.ZodTypeAny>(
  itemSchema: Schema,
) =>
  z.preprocess(
    (value) => toCommaSeparatedArray(value),
    z.array(itemSchema).optional(),
  );

export const commaSeparatedStringParam = () =>
  commaSeparatedParam(z.string().min(1));
