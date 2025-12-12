/**
 * CreateParticipant Use Case
 * Cas d'usage: Créer un nouveau participant à une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { IParticipantRepository } from '@/core/ports/participant.repository';
import type { ParticipantEntity } from '@/core/entities/participant.entity';
import { Email } from '@/core/value-objects/email.vo';
import type { CampaignId } from '@/lib/types/branded.type';

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
  constructor(private readonly participantRepository: IParticipantRepository) {}

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
    const existingParticipant = await this.participantRepository.findByEmailAndCampaign(
      input.email.trim().toLowerCase() as Email,
      input.campaignId as CampaignId,
    );

    if (existingParticipant) {
      return fail(new Error('You have already registered for this campaign'));
    }

    // Créer l'objet Email
    const emailResult = Email.create(input.email);
    if (!emailResult.success) {
      return fail(emailResult.error);
    }

    // Créer le participant via le repository
    const createResult = await this.participantRepository.create({
      email: emailResult.data,
      name: input.name?.trim(),
      phone: input.phone?.trim(),
      campaignId: input.campaignId as CampaignId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    if (!createResult.success) {
      return fail(createResult.error);
    }

    return ok({
      participant: createResult.data,
    });
  }
}
