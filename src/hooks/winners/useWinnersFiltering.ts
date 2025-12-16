/**
 * Hook pour gérer le filtrage des winners
 */

type WinnerStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | undefined;

interface WinnerItem {
  id: string;
  participantName?: string | null;
  participantEmail?: string | null;
  claimCode: string;
  expiresAt: Date | string;
  [key: string]: unknown;
}

interface FilterParams {
  winners: WinnerItem[];
  searchQuery: string;
  statusFilter: WinnerStatus;
}

export function useWinnersFiltering({ winners, searchQuery, statusFilter }: FilterParams) {
  const filteredWinners = winners.filter((winner) => {
    // Filtre de recherche
    const matchesSearch =
      searchQuery === '' ||
      winner.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.participantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.claimCode.toLowerCase().includes(searchQuery.toLowerCase());

    // Si filtre PENDING, exclure les expirés
    const isExpired = new Date() > new Date(winner.expiresAt);
    if (statusFilter === 'PENDING' && isExpired) {
      return false;
    }

    return matchesSearch;
  });

  return filteredWinners;
}
