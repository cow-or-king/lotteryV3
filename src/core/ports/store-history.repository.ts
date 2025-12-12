/**
 * StoreHistory Repository Port
 * Interface pour gérer l'historique des commerces (anti-fraude)
 * IMPORTANT: ZERO any types
 */

export interface StoreHistoryCreate {
  googleBusinessUrl: string;
  storeName: string;
  userId: string;
  userEmail: string;
  wasOnFreePlan: boolean;
}

export interface StoreHistoryRepository {
  /**
   * Vérifie si une URL Google Business a déjà été utilisée sur un compte gratuit
   */
  checkUrlUsedOnFreePlan(googleBusinessUrl: string): Promise<boolean>;

  /**
   * Archive un commerce supprimé dans l'historique
   */
  create(data: StoreHistoryCreate): Promise<void>;
}
