/**
 * Index file for campaigns hooks
 * Export all hooks for campaigns management
 */

export { useCampaignsList } from './useCampaignsList';
export type { Campaign } from './useCampaignsList';

export { useCampaignActions } from './useCampaignActions';
export type { ToggleCampaignData, DeleteCampaignData } from './useCampaignActions';

// Re-export from useCampaigns for backward compatibility
export {
  useAllCampaigns,
  useCampaign,
  useCampaignsByStore,
  useToggleCampaignStatus,
  useDeleteCampaign,
  useGameSuggestion,
  useCreateCampaign,
} from './useCampaigns';
