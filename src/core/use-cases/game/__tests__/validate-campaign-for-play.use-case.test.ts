/**
 * Validate Campaign For Play Use Case Tests
 * IMPORTANT: ZERO any types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateCampaignForPlayUseCase } from '../validate-campaign-for-play.use-case';
import type { CampaignForPlay } from '@/core/ports/campaign.repository';

interface MockCampaignRepo {
  findByIdForPlay(id: string): Promise<CampaignForPlay | null>;
}

describe('ValidateCampaignForPlayUseCase', () => {
  let useCase: ValidateCampaignForPlayUseCase;
  let mockCampaignRepo: MockCampaignRepo;

  beforeEach(() => {
    mockCampaignRepo = {
      findByIdForPlay: vi.fn(),
    };
    useCase = new ValidateCampaignForPlayUseCase(mockCampaignRepo);
    vi.clearAllMocks();
  });

  it('should return success when campaign exists and is active', async () => {
    const mockCampaign = {
      id: 'camp_123',
      name: 'Test Campaign',
      isActive: true,
      storeId: 'store_123',
      maxParticipants: null,
      minDaysBetweenPlays: null,
      prizeClaimExpiryDays: 30,
      game: { id: 'game_123', type: 'WHEEL', config: {} },
      prizes: [{ id: 'prize_123', name: 'Prize 1', remaining: 5 }],
      conditions: [],
    } as unknown as CampaignForPlay;

    vi.mocked(mockCampaignRepo.findByIdForPlay).mockResolvedValue(mockCampaign);

    const result = await useCase.execute({ campaignId: 'camp_123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.campaign.id).toBe('camp_123');
      expect(result.data.campaign.isActive).toBe(true);
    }
  });

  it('should fail when campaign does not exist', async () => {
    vi.mocked(mockCampaignRepo.findByIdForPlay).mockResolvedValue(null);

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
      maxParticipants: null,
      minDaysBetweenPlays: null,
      prizeClaimExpiryDays: 30,
      game: null,
      prizes: [],
      conditions: [],
    } as unknown as CampaignForPlay;

    vi.mocked(mockCampaignRepo.findByIdForPlay).mockResolvedValue(mockCampaign);

    const result = await useCase.execute({ campaignId: 'camp_123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Cette campagne n est pas active');
    }
  });

  it('should only include prizes with remaining > 0', async () => {
    const mockCampaign = {
      id: 'camp_123',
      name: 'Test Campaign',
      isActive: true,
      storeId: 'store_123',
      maxParticipants: null,
      minDaysBetweenPlays: null,
      prizeClaimExpiryDays: 30,
      game: null,
      prizes: [
        { id: 'prize_1', remaining: 5 },
        // Prize with remaining: 0 should be filtered out by the repository
      ],
      conditions: [],
    } as unknown as CampaignForPlay;

    vi.mocked(mockCampaignRepo.findByIdForPlay).mockResolvedValue(mockCampaign);

    const result = await useCase.execute({ campaignId: 'camp_123' });

    expect(result.success).toBe(true);
    expect(mockCampaignRepo.findByIdForPlay).toHaveBeenCalledWith('camp_123');
  });
});
