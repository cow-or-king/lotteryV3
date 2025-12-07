/**
 * Participant Repository Port
 * Interface pour abstraire l'accès aux participants
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

export type {
  ParticipantData,
  CreateParticipantData,
  IParticipantRepository,
} from '@/core/repositories/participant.repository.interface';
