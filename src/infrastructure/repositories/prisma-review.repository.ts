/**
 * Prisma Review Repository
 * Implémentation Prisma de IReviewRepository
 * IMPORTANT: Couche infrastructure, dépendance à Prisma OK
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { Result } from '@/lib/types/result.type';
import { ReviewEntity } from '@/core/entities/review.entity';
import {
  IReviewRepository,
  CreateReviewData,
  UpdateReviewData,
  ReviewFilters,
  ReviewStats,
} from '@/core/repositories/review.repository.interface';
import { ReviewId, StoreId, CampaignId } from '@/lib/types/branded.type';
import * as ReviewMapper from './mappers/review.mapper';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ReviewId): Promise<ReviewEntity | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    return review ? ReviewMapper.toDomain(review) : null;
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<ReviewEntity | null> {
    const review = await this.prisma.review.findUnique({
      where: { googleReviewId },
    });

    return review ? ReviewMapper.toDomain(review) : null;
  }

  async findByStore(
    storeId: StoreId,
    filters?: ReviewFilters,
    limit?: number,
    offset?: number,
  ): Promise<readonly ReviewEntity[]> {
    const where = this.buildWhereClause(storeId, filters);

    const reviews = await this.prisma.review.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { publishedAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async findByCampaign(
    campaignId: CampaignId,
    limit?: number,
    offset?: number,
  ): Promise<readonly ReviewEntity[]> {
    const reviews = await this.prisma.review.findMany({
      where: { campaignId },
      take: limit,
      skip: offset,
      orderBy: { publishedAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async findByEmailAndStore(email: string, storeId: StoreId): Promise<ReviewEntity | null> {
    const review = await this.prisma.review.findFirst({
      where: {
        storeId,
        authorEmail: email,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return review ? ReviewMapper.toDomain(review) : null;
  }

  async create(data: CreateReviewData): Promise<Result<ReviewEntity>> {
    try {
      const prismaData = ReviewMapper.toCreateData(data);

      const review = await this.prisma.review.create({
        data: prismaData,
      });

      return Result.ok(ReviewMapper.toDomain(review));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return Result.fail(new Error('Review with this Google ID already exists'));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async update(id: ReviewId, data: UpdateReviewData): Promise<Result<ReviewEntity>> {
    try {
      const review = await this.prisma.review.update({
        where: { id },
        data: {
          ...data,
          aiSuggestion: data.aiSuggestion
            ? (JSON.stringify(data.aiSuggestion) as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
          updatedAt: new Date(),
        },
      });

      return Result.ok(ReviewMapper.toDomain(review));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Review ${id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async save(review: ReviewEntity): Promise<Result<ReviewEntity>> {
    try {
      const updateData = ReviewMapper.toUpdateData(review);

      const updated = await this.prisma.review.update({
        where: { id: review.id },
        data: {
          ...updateData,
          aiSuggestion: updateData.aiSuggestion
            ? (updateData.aiSuggestion as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
      });

      return Result.ok(ReviewMapper.toDomain(updated));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Review ${review.id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async delete(id: ReviewId): Promise<Result<void>> {
    try {
      await this.prisma.review.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Review ${id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async countByStore(storeId: StoreId, filters?: ReviewFilters): Promise<number> {
    const where = this.buildWhereClause(storeId, filters);
    return this.prisma.review.count({ where });
  }

  async getStatsByStore(storeId: StoreId, filters?: ReviewFilters): Promise<ReviewStats> {
    const where = this.buildWhereClause(storeId, filters);

    const [total, reviews, withResponse] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        select: { rating: true },
      }),
      this.prisma.review.count({
        where: { ...where, hasResponse: true },
      }),
    ]);

    if (total === 0) {
      return {
        total: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        responseRate: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        needsAttentionCount: 0,
      };
    }

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    reviews.forEach(({ rating }) => {
      if (rating !== null && rating !== undefined && rating >= 1 && rating <= 5) {
        const ratingKey = rating as 1 | 2 | 3 | 4 | 5;
        if (ratingDistribution[ratingKey] !== undefined) {
          ratingDistribution[ratingKey]++;
        }
        totalRating += rating;

        if (rating >= 4) {
          positiveCount++;
        } else if (rating === 3) {
          neutralCount++;
        } else {
          negativeCount++;
        }
      }
    });

    const averageRating = totalRating / total;
    const responseRate = (withResponse / total) * 100;

    // Count reviews needing attention (rating <= 3 && !hasResponse)
    const needsAttentionCount = await this.prisma.review.count({
      where: {
        ...where,
        rating: { lte: 3 },
        hasResponse: false,
      },
    });

    return {
      total,
      averageRating,
      ratingDistribution,
      responseRate,
      positiveCount,
      neutralCount,
      negativeCount,
      needsAttentionCount,
    };
  }

  async exists(googleReviewId: string): Promise<boolean> {
    const count = await this.prisma.review.count({
      where: { googleReviewId },
    });

    return count > 0;
  }

  async findNeedingAttention(storeId: StoreId, limit?: number): Promise<readonly ReviewEntity[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        storeId,
        rating: { lte: 3 },
        hasResponse: false,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async upsertMany(reviews: CreateReviewData[]): Promise<Result<void>> {
    try {
      // Use transaction for atomicity
      await this.prisma.$transaction(
        reviews.map((review) => {
          const prismaData = ReviewMapper.toCreateData(review);

          return this.prisma.review.upsert({
            where: { googleReviewId: review.googleReviewId },
            create: prismaData,
            update: {
              rating: prismaData.rating,
              comment: prismaData.comment,
              photoUrl: prismaData.photoUrl,
              updatedAt: new Date(),
            },
          });
        }),
      );

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  /**
   * Helper: Construit la clause WHERE pour les filtres
   */
  private buildWhereClause(storeId: StoreId, filters?: ReviewFilters): Prisma.ReviewWhereInput {
    const where: Prisma.ReviewWhereInput = { storeId };

    if (!filters) {
      return where;
    }

    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters.rating !== undefined) {
      where.rating = filters.rating;
    }

    if (filters.hasResponse !== undefined) {
      where.hasResponse = filters.hasResponse;
    }

    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.publishedAt = {};
      if (filters.fromDate) {
        where.publishedAt.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.publishedAt.lte = filters.toDate;
      }
    }

    return where;
  }
}
