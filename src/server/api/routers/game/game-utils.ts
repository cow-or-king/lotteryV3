/**
 * Game Utility Functions
 * Fonctions utilitaires pour la gestion des jeux
 */

/**
 * Génère un code de réclamation unique au format ABC-123-XYZ
 */
export function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  const segments = [
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ];
  return segments.join('-');
}

/**
 * Sélectionne un lot basé sur les probabilités
 * Retourne null si aucun lot n'est gagné
 */
export function selectPrize(
  prizes: Array<{
    id: string;
    name: string;
    description: string | null;
    value: number | null;
    color: string;
    probability: number;
    quantity: number;
    remaining: number;
  }>,
): {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  color: string;
} | null {
  if (prizes.length === 0) {
    return null;
  }

  // Calculer la somme des probabilités
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);

  // Générer un nombre aléatoire
  const random = Math.random() * 100;

  // Si le nombre est supérieur à la somme des probabilités, l'utilisateur ne gagne rien
  if (random > totalProbability) {
    return null;
  }

  // Sélectionner le lot
  let cumulativeProbability = 0;
  for (const prize of prizes) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability) {
      return {
        id: prize.id,
        name: prize.name,
        description: prize.description,
        value: prize.value,
        color: prize.color,
      };
    }
  }

  return null;
}
