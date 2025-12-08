/**
 * Hook pour la gestion des réponses aux reviews
 * Mutation pour respond, état modal
 */

'use client';

import { useState } from 'react';

interface Review {
  reviewId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  publishedAt: Date;
  hasResponse: boolean;
}

export function useReviewResponse() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setIsOpen(true);
  };

  const closeResponseModal = () => {
    setIsOpen(false);
    setSelectedReview(null);
  };

  return {
    isOpen,
    selectedReview,
    openResponseModal,
    closeResponseModal,
  };
}
