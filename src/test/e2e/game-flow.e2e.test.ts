/**
 * E2E Test: Critical Game Flow
 * Tests the complete user journey: Google Review → Complete Conditions → Play Game → Win Prize
 * IMPORTANT: ZERO any types
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/database/prisma-client';
import { appRouter } from '@/server/api/root';
import type { inferProcedureInput } from '@trpc/server';

describe('E2E: Critical Game Flow', () => {
  let campaignId: string;
  let storeId: string;
  let brandId: string;
  const testPlayerEmail = `e2e-test-${Date.now()}@test.com`;
  const testPlayerName = 'E2E Test Player';

  beforeAll(async () => {
    // Setup: Use existing brand or skip if none exists
    const existingBrand = await prisma.brand.findFirst();
    if (!existingBrand) {
      console.warn('No brand found, skipping E2E test setup');
      return;
    }
    brandId = existingBrand.id;

    const store = await prisma.store.create({
      data: {
        name: 'E2E Test Store',
        address: '123 Test St',
        city: 'TestCity',
        postalCode: '12345',
        country: 'France',
        brandId: existingBrand.id,
        googlePlaceId: `test-place-${Date.now()}`,
      },
    });
    storeId = store.id;

    // Create campaign with game and prizes
    const campaign = await prisma.campaign.create({
      data: {
        name: 'E2E Test Campaign',
        description: 'Test campaign for E2E',
        storeId: store.id,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        shortCode: `e2e${Date.now()}`,
      },
    });
    campaignId = campaign.id;

    // Create game
    await prisma.game.create({
      data: {
        campaignId: campaign.id,
        type: 'WHEEL',
        config: {
          segments: [
            { id: 'seg1', label: 'Prize 1', color: '#FF0000' },
            { id: 'seg2', label: 'Prize 2', color: '#00FF00' },
          ],
        },
      },
    });

    // Create prizes
    await prisma.prize.createMany({
      data: [
        {
          campaignId: campaign.id,
          name: 'Test Prize 1',
          description: 'First test prize',
          value: 10,
          probability: 50,
          quantity: 10,
          remaining: 10,
          color: '#FF0000',
        },
        {
          campaignId: campaign.id,
          name: 'Test Prize 2',
          description: 'Second test prize',
          value: 20,
          probability: 50,
          quantity: 10,
          remaining: 10,
          color: '#00FF00',
        },
      ],
    });

    // Create conditions
    await prisma.campaignCondition.create({
      data: {
        campaignId: campaign.id,
        type: 'GOOGLE_REVIEW',
        title: 'Laisser un avis Google',
        description: 'Partagez votre expérience',
        order: 1,
        isRequired: true,
        enablesGame: true,
        config: {},
      },
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data (skip if no campaignId)
    if (!campaignId) return;

    try {
      await prisma.winner.deleteMany({ where: { participantEmail: testPlayerEmail } });
      await prisma.participant.deleteMany({ where: { campaignId } });
      await prisma.campaignCondition.deleteMany({ where: { campaignId } });
      await prisma.prize.deleteMany({ where: { campaignId } });
      await prisma.game.deleteMany({ where: { campaignId } });
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
      if (storeId) await prisma.store.deleteMany({ where: { id: storeId } });
      // Don't delete brand (it was existing)
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  it('should complete full game flow: conditions → play → win', async () => {
    const caller = appRouter.createCaller({ session: null, prisma });

    // Step 1: Get campaign and verify conditions exist
    const campaign = await caller.game.getCampaignPublic({ id: campaignId });
    expect(campaign).toBeDefined();
    expect(campaign.isActive).toBe(true);

    // Step 2: Check conditions progress (should have 1 condition)
    const conditionsProgress = await caller.game.getConditionsProgress({
      campaignId,
      playerEmail: testPlayerEmail,
    });
    expect(conditionsProgress.conditions.length).toBe(1);
    expect(conditionsProgress.canPlay).toBe(false);
    expect(conditionsProgress.currentCondition).toBeDefined();

    // Step 3: Complete the Google Review condition
    const condition = conditionsProgress.conditions[0];
    if (!condition) throw new Error('No condition found');

    const completeResult = await caller.game.completeCondition({
      campaignId,
      conditionId: condition.id,
      playerEmail: testPlayerEmail,
      playerName: testPlayerName,
    });
    expect(completeResult.success).toBe(true);

    // Step 4: Verify can now play
    const updatedProgress = await caller.game.getConditionsProgress({
      campaignId,
      playerEmail: testPlayerEmail,
    });
    expect(updatedProgress.canPlay).toBe(true);

    // Step 5: Play the game
    type PlayGameInput = inferProcedureInput<typeof appRouter.game.play>;
    const playInput: PlayGameInput = {
      campaignId,
      playerEmail: testPlayerEmail,
      playerName: testPlayerName,
    };

    const gameResult = await caller.game.play(playInput);

    // Step 6: Verify game result
    expect(gameResult).toBeDefined();
    expect(gameResult.participantId).toBeDefined();
    expect(typeof gameResult.hasWon).toBe('boolean');

    if (gameResult.hasWon && gameResult.prize) {
      // Verify prize was awarded
      expect(gameResult.prize.id).toBeDefined();
      expect(gameResult.prize.name).toBeDefined();
      expect(gameResult.claimCode).toBeDefined();

      // Verify winner record created
      const winner = await prisma.winner.findFirst({
        where: {
          participantEmail: testPlayerEmail,
          claimCode: gameResult.claimCode || undefined,
        },
      });
      expect(winner).toBeDefined();
      expect(winner?.status).toBe('PENDING');

      // Verify prize quantity decremented
      const prize = await prisma.prize.findUnique({
        where: { id: gameResult.prize.id },
      });
      expect(prize?.remaining).toBeLessThan(10);
    }

    // Step 7: Verify participant record
    const participant = await prisma.participant.findFirst({
      where: {
        campaignId,
        email: testPlayerEmail,
      },
    });
    expect(participant).toBeDefined();
    expect(participant?.hasPlayed).toBe(true);
    expect(participant?.playCount).toBe(1);

    // Step 8: Verify cannot play again (already played for this condition)
    await expect(caller.game.play(playInput)).rejects.toThrow();
  });

  it('should handle campaign not found', async () => {
    const caller = appRouter.createCaller({ session: null, prisma });

    await expect(caller.game.getCampaignPublic({ id: 'non-existent-id' })).rejects.toThrow(
      'Campagne introuvable',
    );
  });

  it('should prevent playing without completing conditions', async () => {
    const caller = appRouter.createCaller({ session: null, prisma });

    type PlayGameInput = inferProcedureInput<typeof appRouter.game.play>;
    const playInput: PlayGameInput = {
      campaignId,
      playerEmail: 'new-player@test.com',
      playerName: 'New Player',
    };

    await expect(caller.game.play(playInput)).rejects.toThrow();
  });
});
