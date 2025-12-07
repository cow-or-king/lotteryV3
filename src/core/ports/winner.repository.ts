/**
 * Winner Repository Port
 * Interface pour abstraire l'accès aux gagnants
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

export type {
  WinnerData,
  CreateWinnerData,
  WinnerStatus,
  IWinnerRepository,
} from '@/core/repositories/winner.repository.interface';
