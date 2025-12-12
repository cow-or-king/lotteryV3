/**
 * ReviewCard Component Tests
 * Tests unitaires pour le composant ReviewCard
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';
import { ReviewDTO } from '@/lib/types/review.types';

describe('ReviewCard', () => {
  const mockReview: ReviewDTO = {
    reviewId: '123',
    googleReviewId: 'google-123',
    authorName: 'John Doe',
    rating: 5,
    comment: 'Great service!',
    publishedAt: '2024-01-15T10:00:00Z',
    hasResponse: false,
    isVerified: true,
    status: 'PENDING',
    sentiment: 'POSITIVE',
    needsAttention: false,
    isPositive: true,
  };

  it('renders author name correctly', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders comment correctly', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('Great service!')).toBeInTheDocument();
  });

  it('renders 5 stars for 5-star rating', () => {
    const { container } = render(<ReviewCard review={mockReview} />);
    const stars = container.querySelectorAll('svg.lucide-star');
    expect(stars).toHaveLength(5);
  });

  it('shows "En attente" status when no response', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('shows "Répondu" status when has response', () => {
    const reviewWithResponse = { ...mockReview, hasResponse: true };
    render(<ReviewCard review={reviewWithResponse} />);
    expect(screen.getByText('Répondu')).toBeInTheDocument();
  });

  it('shows "Nécessite attention" badge for low ratings without response', () => {
    const lowRatingReview = { ...mockReview, rating: 2, hasResponse: false };
    render(<ReviewCard review={lowRatingReview} />);
    expect(screen.getByText('Attention')).toBeInTheDocument();
  });

  it('does not show attention badge for low ratings with response', () => {
    const lowRatingReview = { ...mockReview, rating: 2, hasResponse: true };
    render(<ReviewCard review={lowRatingReview} />);
    expect(screen.queryByText('Attention')).not.toBeInTheDocument();
  });

  it('renders author initial in avatar', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText(/15 janv\. 2024/i)).toBeInTheDocument();
  });

  it('does not render comment section when comment is null', () => {
    const reviewWithoutComment = { ...mockReview, comment: null };
    render(<ReviewCard review={reviewWithoutComment} />);
    expect(screen.queryByText('Great service!')).not.toBeInTheDocument();
  });
});
