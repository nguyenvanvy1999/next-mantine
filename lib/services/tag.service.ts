import { prisma } from '@/lib/auth';
import type { Prisma } from '@/lib/generated/prisma/client';
import { DB_PREFIX, ErrorCode, idUtil, throwAppError } from '@/lib/utils';
import { deleteManyResources } from '@/lib/utils/delete-many.util';
import { validateResourceOwnership } from '@/lib/utils/ownership.util';
import { calculatePagination } from '@/lib/utils/pagination.util';
import type {
  ListTagsQuery,
  TagListResponse,
  TagResponse,
  UpsertTagDto,
} from '@/types/tag';
import type { BaseServiceDependencies } from './base/base.service';
import { BaseService } from './base/base.service';
import { mapTag } from './mappers/tag.mapper';
import { TAG_SELECT_FULL, TAG_SELECT_MINIMAL } from './selects';

export class TagService extends BaseService {
  constructor(deps: BaseServiceDependencies = { db: prisma, idUtil }) {
    super(deps);
  }

  private async validateUniqueName(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const normalizedName = name.toLowerCase().trim();

    const where: Prisma.TagWhereInput = {
      userId,
      name: normalizedName,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    const count = await this.db.tag.count({ where });

    if (count > 0) {
      throwAppError(ErrorCode.DUPLICATE_NAME, 'Tag name already exists');
    }
  }

  async upsertTag(userId: string, data: UpsertTagDto): Promise<TagResponse> {
    if (data.id) {
      validateResourceOwnership(
        userId,
        data.id,
        this.idUtil,
        ErrorCode.TAG_NOT_FOUND,
        'Tag not found',
      );
    }

    const lowerName = data.name.toLowerCase().trim();
    await this.validateUniqueName(userId, lowerName, data.id);

    if (data.id) {
      const tag = await this.db.tag.update({
        where: { id: data.id },
        data: {
          name: lowerName,
          description: data.description ?? null,
        },
        select: TAG_SELECT_FULL,
      });
      return mapTag(tag);
    } else {
      const tag = await this.db.tag.create({
        data: {
          id: this.idUtil.dbIdWithUserId(DB_PREFIX.TAG, userId),
          userId,
          name: lowerName,
          description: data.description ?? null,
        },
        select: TAG_SELECT_FULL,
      });
      return mapTag(tag);
    }
  }

  async getTag(userId: string, tagId: string): Promise<TagResponse> {
    const tag = await this.db.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
      select: TAG_SELECT_FULL,
    });

    if (!tag) {
      throwAppError(ErrorCode.TAG_NOT_FOUND, 'Tag not found');
    }

    return mapTag(tag);
  }

  async listTags(
    userId: string,
    query: ListTagsQuery,
  ): Promise<TagListResponse> {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.TagWhereInput = {
      userId,
    };

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    type TagSortKey = NonNullable<ListTagsQuery['sortBy']>;
    const orderBy = this.buildOrderBy<
      TagSortKey,
      Prisma.TagOrderByWithRelationInput
    >(sortBy, sortOrder, {
      name: 'name',
      created: 'created',
    }) as Prisma.TagOrderByWithRelationInput | undefined;

    const { skip, take } = calculatePagination(page, limit);

    const [tags, total] = await Promise.all([
      this.db.tag.findMany({
        where,
        orderBy,
        skip,
        take,
        select: TAG_SELECT_FULL,
      }),
      this.db.tag.count({ where }),
    ]);

    return {
      tags: tags.map(mapTag),
      pagination: this.buildPaginationResponse(page, limit, total, [])
        .pagination,
    };
  }

  deleteManyTags(userId: string, ids: string[]) {
    return deleteManyResources({
      db: this.db,
      model: 'tag',
      userId,
      ids,
      selectMinimal: TAG_SELECT_MINIMAL,
      errorCode: ErrorCode.TAG_NOT_FOUND,
      errorMessage: 'Some tags were not found or do not belong to you',
      resourceName: 'tag',
    });
  }
}

export const tagService = new TagService();
