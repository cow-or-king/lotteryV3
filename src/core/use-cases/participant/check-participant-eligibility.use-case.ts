/**
 * CheckParticipantEligibility Use Case
 * Cas d'usage: Vérifier si un participant peut jouer à une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { ParticipantRepository } from '@/core/ports/participant.repository';
import type { CampaignRepository } from '@/core/ports/campaign.repository';

export interface CheckParticipantEligibilityInput {
  email: string;
  campaignId: string;
}

export interface CheckParticipantEligibilityOutput {
  isEligible: boolean;
  reason?: string;
  canPlay: boolean;
  hasPlayed: boolean;
  participantId?: string;
}

export class CheckParticipantEligibilityUseCase {
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly campaignRepository: CampaignRepository,
  ) {}

  async execute(
    input: CheckParticipantEligibilityInput,
  ): Promise<Result<CheckParticipantEligibilityOutput>> {
    // Validation de l'email
    if (!input.email || input.email.trim().length === 0) {
      return fail(new Error('Email is required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      return fail(new Error('Invalid email format'));
    }

    // Validation du campaign ID
    if (!input.campaignId || input.campaignId.trim().length === 0) {
      return fail(new Error('Campaign ID is required'));
    }

    // Vérifier que la campagne existe et est active
    const campaignResult = await this.campaignRepository.findById(input.campaignId);

    if (!campaignResult.success) {
      return fail(campaignResult.error);
    }

    const campaign = campaignResult.value;

    if (!campaign) {
      return fail(new Error('Campaign not found'));
    }

    if (!campaign.isActive) {
      return ok({
        isEligible: false,
        reason: 'This campaign is not currently active',
        canPlay: false,
        hasPlayed: false,
      });
    }

    // Vérifier les dates de la campagne
    const now = new Date();
    if (now < campaign.startDate) {
      return ok({
        isEligible: false,
        reason: 'This campaign has not started yet',
        canPlay: false,
        hasPlayed: false,
      });
    }

    if (now > campaign.endDate) {
      return ok({
        isEligible: false,
        reason: 'This campaign has ended',
        canPlay: false,
        hasPlayed: false,
      });
    }

    // Vérifier si le participant existe
    const participantResult = await this.participantRepository.findByEmailAndCampaignId(
      input.email.trim().toLowerCase(),
      input.campaignId,
    );

    if (!participantResult.success) {
      return fail(participantResult.error);
    }

    const participant = participantResult.value;

    if (!participant) {
      // Nouveau participant - éligible
      return ok({
        isEligible: true,
        canPlay: true,
        hasPlayed: false,
      });
    }

    // Participant existant - vérifier s'il a déjà joué
    if (participant.hasPlayed) {
      return ok({
        isEligible: false,
        reason: 'You have already played in this campaign',
        canPlay: false,
        hasPlayed: true,
        participantId: participant.id,
      });
    }

    // Participant inscrit mais n'a pas encore joué
    return ok({
      isEligible: true,
      canPlay: true,
      hasPlayed: false,
      participantId: participant.id,
    });
  }
}
