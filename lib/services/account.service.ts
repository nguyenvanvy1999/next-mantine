import { prisma } from '@/lib/auth';
import type { Prisma } from '@/lib/generated/prisma/client';
import { DB_PREFIX, ErrorCode, idUtil, throwAppError } from '@/lib/utils';
import { deleteManyResources } from '@/lib/utils/delete-many.util';
import { validateResourceOwnership } from '@/lib/utils/ownership.util';
import { calculatePagination } from '@/lib/utils/pagination.util';
import type {
  AccountListResponse,
  AccountResponse,
  AccountType,
  ActionRes,
  UpsertAccountDto,
} from '@/types/account';
import type { BaseServiceDependencies } from './base/base.service';
import { BaseService } from './base/base.service';
import { mapAccount } from './mappers/account.mapper';
import {
  ACCOUNT_SELECT_FULL,
  ACCOUNT_SELECT_MINIMAL,
  CURRENCY_SELECT_BASIC,
} from './selects';

export interface ListAccountsQuery {
  type?: string[];
  currencyId?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created' | 'balance';
  sortOrder?: 'asc' | 'desc';
}

export class AccountService extends BaseService {
  constructor(deps: BaseServiceDependencies = { db: prisma, idUtil }) {
    super(deps);
  }

  private async validateCurrency(currencyId: string) {
    const count = await this.db.currency.count({
      where: { id: currencyId },
    });
    if (count === 0) {
      throwAppError(ErrorCode.CURRENCY_NOT_FOUND, 'Currency not found');
    }
  }

  async upsertAccount(
    userId: string,
    data: UpsertAccountDto,
  ): Promise<ActionRes> {
    await this.validateCurrency(data.currencyId);

    if (data.id) {
      validateResourceOwnership(
        userId,
        data.id,
        this.idUtil,
        ErrorCode.ACCOUNT_NOT_FOUND,
        'Account not found',
      );
    }

    if (
      data.paymentDay !== undefined &&
      (data.paymentDay < 1 || data.paymentDay > 31)
    ) {
      throwAppError(
        ErrorCode.VALIDATION_ERROR,
        'Payment day must be between 1 and 31',
      );
    }

    if (data.notifyDaysBefore !== undefined && data.notifyDaysBefore < 0) {
      throwAppError(
        ErrorCode.VALIDATION_ERROR,
        'Notify days before must be greater than or equal to 0',
      );
    }

    if (data.id) {
      await this.db.financialAccount.update({
        where: { id: data.id },
        data: {
          type: data.type,
          name: data.name,
          currencyId: data.currencyId,
          creditLimit: data.creditLimit ?? null,
          notifyOnDueDate: data.notifyOnDueDate ?? null,
          paymentDay: data.paymentDay ?? null,
          notifyDaysBefore: data.notifyDaysBefore ?? null,
          meta: data.meta ?? undefined,
        },
        select: ACCOUNT_SELECT_MINIMAL,
      });
      return { success: true, message: 'Account updated successfully' };
    } else {
      await this.db.financialAccount.create({
        data: {
          id: this.idUtil.dbIdWithUserId(DB_PREFIX.ACCOUNT, userId),
          type: data.type,
          name: data.name,
          currencyId: data.currencyId,
          creditLimit: data.creditLimit ?? null,
          notifyOnDueDate: data.notifyOnDueDate ?? null,
          paymentDay: data.paymentDay ?? null,
          notifyDaysBefore: data.notifyDaysBefore ?? null,
          meta: data.meta ?? undefined,
          userId,
          balance: data.initialBalance ?? 0,
        },
        select: ACCOUNT_SELECT_MINIMAL,
      });
      return { success: true, message: 'Account created successfully' };
    }
  }

  async getAccount(
    userId: string,
    accountId: string,
  ): Promise<AccountResponse> {
    const account = await this.db.financialAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: ACCOUNT_SELECT_FULL,
    });

    if (!account) {
      throwAppError(ErrorCode.ACCOUNT_NOT_FOUND, 'Account not found');
    }

    return mapAccount(account);
  }

  async listAccounts(
    userId: string,
    query: ListAccountsQuery,
  ): Promise<AccountListResponse> {
    const {
      type,
      currencyId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.AccountWhereInput = {
      userId,
    };

    if (type && type.length > 0) {
      where.type = { in: type as AccountType[] };
    }

    if (currencyId && currencyId.length > 0) {
      where.currencyId = { in: currencyId };
    }

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    type AccountSortKey = NonNullable<ListAccountsQuery['sortBy']>;
    const orderBy = this.buildOrderBy<
      AccountSortKey,
      Prisma.AccountOrderByWithRelationInput
    >(sortBy, sortOrder, {
      name: 'name',
      created: 'created',
      balance: 'balance',
    }) as Prisma.AccountOrderByWithRelationInput | undefined;

    const { skip, take } = calculatePagination(page, limit);

    const [accounts, total, summaryGroups] = await Promise.all([
      this.db.financialAccount.findMany({
        where,
        orderBy,
        skip,
        take,
        select: ACCOUNT_SELECT_FULL,
      }),
      this.db.financialAccount.count({ where }),
      this.db.financialAccount.groupBy({
        by: ['currencyId'],
        where,
        _sum: {
          balance: true,
        },
      }),
    ]);

    const currencyIds = Array.from(
      new Set(summaryGroups.map((g) => g.currencyId)),
    );

    const currencies = await this.db.currency.findMany({
      where: {
        id: { in: currencyIds },
      },
      select: CURRENCY_SELECT_BASIC,
    });

    const currencyMap = new Map(currencies.map((c) => [c.id, c]));

    const summary = summaryGroups
      .map((group) => {
        const currency = currencyMap.get(group.currencyId);
        if (!currency) return null;

        return {
          currency,
          totalBalance: group._sum.balance?.toNumber() ?? 0,
        };
      })
      .filter(
        (
          item,
        ): item is { currency: (typeof currencies)[0]; totalBalance: number } =>
          item !== null,
      );

    return {
      accounts: accounts.map(mapAccount),
      pagination: this.buildPaginationResponse(page, limit, total, [])
        .pagination,
      summary,
    };
  }

  async deleteAccount(userId: string, accountId: string): Promise<ActionRes> {
    validateResourceOwnership(
      userId,
      accountId,
      this.idUtil,
      ErrorCode.ACCOUNT_NOT_FOUND,
      'Account not found',
    );

    await this.db.financialAccount.delete({
      where: { id: accountId },
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  deleteManyAccounts(userId: string, ids: string[]): Promise<ActionRes> {
    return deleteManyResources({
      db: this.db,
      model: 'account',
      userId,
      ids,
      selectMinimal: ACCOUNT_SELECT_MINIMAL,
      errorCode: ErrorCode.ACCOUNT_NOT_FOUND,
      errorMessage: 'Some accounts were not found or do not belong to you',
      resourceName: 'account',
    });
  }
}

export const accountService = new AccountService();
