/**
 * Create Campaign Use Case
 * Gère la création complète d'une campagne avec :
 * - Validation des données
 * - Création de la campagne et des prizes
 * - Association avec un jeu
 * - Mise à jour du QR Code par défaut du commerce pour pointer vers la campagne
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/core/result';
import {
  PrizeConfiguration,
  type PrizeConfig,
} from '@/core/value-objects/prize-configuration.value-object';

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  storeId: string;
  isActive?: boolean;
  prizes: PrizeConfig[];
  gameId?: string;
  maxParticipants?: number;
  prizeClaimExpiryDays?: number;
  requireReview?: boolean;
  requireInstagram?: boolean;
  userId: string; // Pour vérifier les permissions
}

export interface CreateCampaignResult {
  campaignId: string;
  qrCodeUpdated: boolean;
  message: string;
}

export interface CampaignRepository {
  createWithPrizes(data: {
    campaign: {
      name: string;
      description?: string;
      storeId: string;
      gameId?: string;
      maxParticipants?: number;
      prizeClaimExpiryDays: number;
      requireReview: boolean;
      requireInstagram: boolean;
      isActive: boolean;
    };
    prizes: PrizeConfig[];
  }): Promise<{ id: string }>;

  activateCampaign(campaignId: string): Promise<void>;
  deactivateOtherCampaigns(storeId: string, exceptCampaignId: string): Promise<void>;
}

export interface StoreRepository {
  getById(id: string): Promise<{ id: string; defaultQrCodeId: string | null } | null>;
  verifyOwnership(storeId: string, userId: string): Promise<boolean>;
}

export interface QRCodeRepository {
  updateCampaignUrl(qrCodeId: string, campaignId: string): Promise<void>;
}

export class CreateCampaignUseCase {
  constructor(
    private readonly campaignRepo: CampaignRepository,
    private readonly storeRepo: StoreRepository,
    private readonly qrCodeRepo: QRCodeRepository,
  ) {}

  async execute(dto: CreateCampaignDTO): Promise<Result<CreateCampaignResult>> {
    // 1. Validation du nom
    if (!dto.name || dto.name.trim().length < 2) {
      return Result.fail(new Error('Le nom de la campagne doit contenir au moins 2 caractères'));
    }

    if (dto.name.length > 200) {
      return Result.fail(new Error('Le nom de la campagne ne peut pas dépasser 200 caractères'));
    }

    // 2. Validation des prizes avec PrizeConfiguration VO
    const prizeConfigResult = PrizeConfiguration.create(dto.prizes);
    if (!prizeConfigResult.success) {
      return Result.fail(prizeConfigResult.error);
    }

    const prizeConfig = prizeConfigResult.data;

    // 3. Validation maxParticipants
    if (dto.maxParticipants !== undefined && dto.maxParticipants !== null) {
      if (dto.maxParticipants < 1) {
        return Result.fail(new Error('Le nombre maximum de participants doit être au moins 1'));
      }

      if (dto.maxParticipants > 1000000) {
        return Result.fail(
          new Error('Le nombre maximum de participants ne peut pas dépasser 1 000 000'),
        );
      }
    }

    // 4. Validation prizeClaimExpiryDays
    const expiryDays = dto.prizeClaimExpiryDays ?? 30;
    if (expiryDays < 1 || expiryDays > 365) {
      return Result.fail(new Error("La durée d'expiration doit être entre 1 et 365 jours"));
    }

    // 5. Vérifier que le commerce appartient à l'utilisateur
    const hasAccess = await this.storeRepo.verifyOwnership(dto.storeId, dto.userId);
    if (!hasAccess) {
      return Result.fail(new Error("Vous n'avez pas accès à ce commerce"));
    }

    // 6. Récupérer le commerce
    const store = await this.storeRepo.getById(dto.storeId);
    if (!store) {
      return Result.fail(new Error('Commerce introuvable'));
    }

    const isActiveCampaign = dto.isActive ?? false;

    // 7. Créer la campagne avec les prizes
    const campaign = await this.campaignRepo.createWithPrizes({
      campaign: {
        name: dto.name,
        description: dto.description,
        storeId: dto.storeId,
        gameId: dto.gameId,
        maxParticipants: dto.maxParticipants,
        prizeClaimExpiryDays: expiryDays,
        requireReview: dto.requireReview ?? false,
        requireInstagram: dto.requireInstagram ?? false,
        isActive: isActiveCampaign,
      },
      prizes: prizeConfig.getPrizes() as PrizeConfig[],
    });

    // 8. Si la campagne est active, désactiver les autres et mettre à jour le QR
    let qrCodeUpdated = false;

    if (isActiveCampaign) {
      // Désactiver les autres campagnes actives de ce commerce
      await this.campaignRepo.deactivateOtherCampaigns(dto.storeId, campaign.id);

      // 9. IMPORTANT: Mettre à jour le QR Code par défaut du commerce
      // pour qu'il pointe vers cette campagne active
      if (store.defaultQrCodeId) {
        try {
          await this.qrCodeRepo.updateCampaignUrl(store.defaultQrCodeId, campaign.id);
          qrCodeUpdated = true;
        } catch (error) {
          // Log l'erreur mais ne pas faire échouer la création
          console.error('Erreur lors de la mise à jour du QR Code:', error);
        }
      }
    }

    return Result.ok({
      campaignId: campaign.id,
      qrCodeUpdated,
      message: qrCodeUpdated
        ? 'Campagne créée et activée. Le QR Code du commerce pointe maintenant vers cette campagne.'
        : 'Campagne créée avec succès.',
    });
  }
}
