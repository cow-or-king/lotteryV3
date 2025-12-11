import { useState, useEffect } from 'react';
import type { QRCodeListItem } from '@/lib/types/qr-code.types';

// TODO: Connect to tRPC API

/**
 * Custom hook for managing QR code list
 * Handles loading, filtering, and searching of QR codes
 *
 * @returns Object containing QR codes state, loading state, error state, and management functions
 */
export function useQRCodeList() {
  const [qrCodes] = useState<QRCodeListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterByStore, setFilterByStore] = useState<string | null>(null);

  /**
   * Computed filtered QR codes based on search query and store filter
   */
  const filteredQRCodes = qrCodes.filter((qrCode) => {
    // Filter by store if specified
    if (filterByStore && qrCode.storeId !== filterByStore) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        qrCode.name.toLowerCase().includes(query) ||
        qrCode.storeName?.toLowerCase().includes(query) ||
        qrCode.campaignName?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  /**
   * Refreshes the QR code list from the API
   */
  const refreshList = () => {
    // TODO: Implement API call via tRPC
    setIsLoading(true);
    setError(null);
    // Placeholder for future implementation
    setIsLoading(false);
  };

  useEffect(() => {
    refreshList();
  }, []);

  return {
    qrCodes,
    isLoading,
    error,
    searchQuery,
    filterByStore,
    setSearchQuery,
    setFilterByStore,
    refreshList,
    filteredQRCodes,
  };
}
