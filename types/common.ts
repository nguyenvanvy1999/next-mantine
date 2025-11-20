export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ActionRes {
  success: boolean;
  message: string;
}

export interface DeleteManyDto {
  ids: string[];
}

export interface BaseListQuery {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends Date | undefined
        ? string | undefined
        : T[K] extends Date | null | undefined
          ? string | null | undefined
          : T[K];
};

export type DecimalToString<T> = {
  [K in keyof T]: T[K] extends { toString(): string } | { toNumber(): number }
    ? string
    : T[K] extends ({ toString(): string } | { toNumber(): number }) | null
      ? string | null
      : T[K] extends
            | ({ toString(): string } | { toNumber(): number })
            | undefined
        ? string | undefined
        : T[K] extends
              | ({ toString(): string } | { toNumber(): number })
              | null
              | undefined
          ? string | null | undefined
          : T[K];
};
