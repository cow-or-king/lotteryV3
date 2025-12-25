/**
 * Validate Campaign For Play Use Case Tests
 * IMPORTANT: ZERO any types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateCampaignForPlayUseCase } from '../validate-campaign-for-play.use-case';
import { prisma } from '@/infrastructure/database/prisma-client';

vi.mock('@/infrastructure/database/prisma-client', () => ({
  prisma: {
    campaign: {
      findUnique: vi.fn(),
    },
  },
}));

describe('ValidateCampaignForPlayUseCase', () => {
  let useCase: ValidateCampaignForPlayUseCase;

  beforeEach(() => {
    useCase = new ValidateCampaignForPlayUseCase();
    vi.clearAllMocks();
  });

  it('should return success when campaign exists and is active', async () => {
    const mockCampaign = {
      id: 'camp_123',
      name: 'Test Campaign',
      isActive: true,
      storeId: 'store_123',
      game: { id: 'game_123', type: 'WHEEL', config: {} },
      prizes: [{ id: 'prize_123', name: 'Prize 1', remaining: 5 }],
      conditions: [],
    };

    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(mockCampaign as never);

    const result = await useCase.execute({ campaignId: 'camp_123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.campaign.id).toBe('camp_123');
      expect(result.data.campaign.isActive).toBe(true);
    }
  });

  it('should fail when campaign does not exist', async () => {
    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(null);

    const result = await useCase.execute({ campaignId: 'invalid_id' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Campagne introuvable');
    }
  });

  it('should fail when campaign is not active', async () => {
    const mockCampaign = {
      id: 'camp_123',
      name: 'Test Campaign',
      isActive: false,
      storeId: 'store_123',
      game: null,
      prizes: [],
      conditions: [],
    };

    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(mockCampaign as never);

    const result = await useCase.execute({ campaignId: 'camp_123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Cette campagne n est pas active');
    }
  });

  it('should only include prizes with remaining > 0', async () => {
    const mockCampaign = {
      id: 'camp_123',
      isActive: true,
      storeId: 'store_123',
      game: null,
      prizes: [
        { id: 'prize_1', remaining: 5 },
        { id: 'prize_2', remaining: 0 }, // Should be filtered out
      ],
      conditions: [],
    };

    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(mockCampaign as never);

    await useCase.execute({ campaignId: 'camp_123' });

    expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'camp_123' },
      include: {
        game: true,
        prizes: {
          where: {
            remaining: {
              gt: 0,
            },
          },
        },
        conditions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  });
});
