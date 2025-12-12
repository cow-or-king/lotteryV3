/**
 * useReviews Hook Tests
 * Tests unitaires pour le hook useReviews
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReviews } from './useReviews';
import { api } from '@/lib/trpc/client';

// Mock tRPC client
vi.mock('@/lib/trpc/client', () => ({
  api: {
    review: {
      getStats: {
        useQuery: vi.fn(),
      },
      listByStore: {
        useQuery: vi.fn(),
      },
      sync: {
        useMutation: vi.fn(),
      },
    },
    useUtils: vi.fn(),
  },
}));

describe('useReviews', () => {
  const mockStoreId = 'store-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock implementation du utils
    (api.useUtils as any).mockReturnValue({
      review: {
        getStats: {
          invalidate: vi.fn(),
        },
        listByStore: {
          invalidate: vi.fn(),
        },
      },
    });
  });

  it('fetches stats when storeId is provided', () => {
    const mockStats = {
      total: 100,
      avgRating: 4.5,
      pending: 10,
    };

    (api.review.getStats.useQuery as any).mockReturnValue({
      data: mockStats,
      isLoading: false,
    });

    (api.review.listByStore.useQuery as any).mockReturnValue({
      data: { reviews: [], total: 0 },
      isLoading: false,
    });

    (api.review.sync.useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useReviews({ storeId: mockStoreId }));

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.statsLoading).toBe(false);
  });

  it('fetches reviews list when storeId is provided', () => {
    const mockReviews = {
      reviews: [
        {
          reviewId: '1',
          authorName: 'John',
          rating: 5,
        },
      ],
      total: 1,
    };

    (api.review.getStats.useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (api.review.listByStore.useQuery as any).mockReturnValue({
      data: mockReviews,
      isLoading: false,
    });

    (api.review.sync.useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useReviews({ storeId: mockStoreId }));

    expect(result.current.reviewsData).toEqual(mockReviews);
    expect(result.current.reviewsLoading).toBe(false);
  });

  it('provides sync mutation function', () => {
    const mockMutate = vi.fn();

    (api.review.getStats.useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (api.review.listByStore.useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (api.review.sync.useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const { result } = renderHook(() => useReviews({ storeId: mockStoreId }));

    expect(result.current.syncMutation.mutate).toBe(mockMutate);
  });

  it('does not fetch when storeId is null', () => {
    const mockGetStatsQuery = vi.fn().mockReturnValue({
      data: null,
      isLoading: false,
    });

    (api.review.getStats.useQuery as any) = mockGetStatsQuery;

    (api.review.listByStore.useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (api.review.sync.useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    renderHook(() => useReviews({ storeId: null }));

    // Vérifie que useQuery a été appelé avec enabled: false
    expect(mockGetStatsQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    );
  });
});
