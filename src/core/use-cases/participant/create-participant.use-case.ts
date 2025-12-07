/**
 * CreateParticipant Use Case
 * Cas d'usage: Créer un nouveau participant à une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { ParticipantRepository } from '@/core/ports/participant.repository';
import type { ParticipantEntity } from '@/core/entities/participant.entity';

export interface CreateParticipantInput {
  email: string;
  name?: string;
  phone?: string;
  campaignId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateParticipantOutput {
  participant: ParticipantEntity;
}

export class CreateParticipantUseCase {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  async execute(input: CreateParticipantInput): Promise<Result<CreateParticipantOutput>> {
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

    // Vérifier si le participant existe déjà
    const existingParticipantResult = await this.participantRepository.findByEmailAndCampaignId(
      input.email.trim().toLowerCase(),
      input.campaignId,
    );

    if (!existingParticipantResult.success) {
      return fail(existingParticipantResult.error);
    }

    if (existingParticipantResult.value) {
      return fail(new Error('You have already registered for this campaign'));
    }

    // Créer le participant
    const participant: ParticipantEntity = {
      id: '', // Will be set by repository
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() || null,
      phone: input.phone?.trim() || null,
      campaignId: input.campaignId,
      hasPlayed: false,
      playedAt: null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      hasReviewed: false,
      reviewRating: null,
      reviewComment: null,
      createdAt: new Date(),
    };

    // Sauvegarder
    const saveResult = await this.participantRepository.save(participant);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      participant: saveResult.value,
    });
  }
}
