import { prisma } from '@/lib/auth';
import type { Prisma } from '@/lib/generated/prisma/client';
import { DB_PREFIX, ErrorCode, idUtil, throwAppError } from '@/lib/utils';
import { deleteManyResources } from '@/lib/utils/delete-many.util';
import { validateResourceOwnership } from '@/lib/utils/ownership.util';
import { calculatePagination } from '@/lib/utils/pagination.util';
import type {
  EntityListResponse,
  EntityResponse,
  ListEntitiesQuery,
  UpsertEntityDto,
} from '@/types/entity';
import type { BaseServiceDependencies } from './base/base.service';
import { BaseService } from './base/base.service';
import { mapEntity } from './mappers/entity.mapper';
import { ENTITY_SELECT_FULL, ENTITY_SELECT_MINIMAL } from './selects';

export class EntityService extends BaseService {
  constructor(deps: BaseServiceDependencies = { db: prisma, idUtil }) {
    super(deps);
  }

  private async validateUniqueName(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const where: Prisma.EntityWhereInput = {
      userId,
      name,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    const count = await this.db.entity.count({ where });

    if (count > 0) {
      throwAppError(ErrorCode.DUPLICATE_NAME, 'Entity name already exists');
    }
  }

  async upsertEntity(
    userId: string,
    data: UpsertEntityDto,
  ): Promise<EntityResponse> {
    if (data.id) {
      validateResourceOwnership(
        userId,
        data.id,
        this.idUtil,
        ErrorCode.ENTITY_NOT_FOUND,
        'Entity not found',
      );
    }

    await this.validateUniqueName(userId, data.name, data.id);

    if (data.id) {
      const entity = await this.db.entity.update({
        where: { id: data.id },
        data: {
          name: data.name,
          type: data.type,
          phone: data.phone ?? null,
          email: data.email ?? null,
          address: data.address ?? null,
          note: data.note ?? null,
        },
        select: ENTITY_SELECT_FULL,
      });
      return mapEntity(entity);
    } else {
      const entity = await this.db.entity.create({
        data: {
          id: this.idUtil.dbIdWithUserId(DB_PREFIX.ENTITY, userId),
          userId,
          name: data.name,
          type: data.type,
          phone: data.phone ?? null,
          email: data.email ?? null,
          address: data.address ?? null,
          note: data.note ?? null,
        },
        select: ENTITY_SELECT_FULL,
      });
      return mapEntity(entity);
    }
  }

  async getEntity(userId: string, entityId: string): Promise<EntityResponse> {
    const entity = await this.db.entity.findFirst({
      where: {
        id: entityId,
        userId,
      },
      select: ENTITY_SELECT_FULL,
    });

    if (!entity) {
      throwAppError(ErrorCode.ENTITY_NOT_FOUND, 'Entity not found');
    }

    return mapEntity(entity);
  }

  async listEntities(
    userId: string,
    query: ListEntitiesQuery,
  ): Promise<EntityListResponse> {
    const {
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.EntityWhereInput = {
      userId,
    };

    if (type && type.length > 0) {
      where.type = { in: type };
    }

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    type EntitySortKey = NonNullable<ListEntitiesQuery['sortBy']>;
    const orderBy = this.buildOrderBy<
      EntitySortKey,
      Prisma.EntityOrderByWithRelationInput
    >(sortBy, sortOrder, {
      name: 'name',
      type: 'type',
      created: 'created',
    }) as Prisma.EntityOrderByWithRelationInput | undefined;

    const { skip, take } = calculatePagination(page, limit);

    const [entities, total] = await Promise.all([
      this.db.entity.findMany({
        where,
        orderBy,
        skip,
        take,
        select: ENTITY_SELECT_FULL,
      }),
      this.db.entity.count({ where }),
    ]);

    return {
      data: entities.map(mapEntity),
      pagination: this.buildPaginationResponse(page, limit, total, [])
        .pagination,
    };
  }

  deleteManyEntities(userId: string, ids: string[]) {
    return deleteManyResources({
      db: this.db,
      model: 'entity',
      userId,
      ids,
      selectMinimal: ENTITY_SELECT_MINIMAL,
      errorCode: ErrorCode.ENTITY_NOT_FOUND,
      errorMessage: 'Some entities were not found or do not belong to you',
      resourceName: 'entity',
    });
  }
}

export const entityService = new EntityService();
