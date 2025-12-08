/**
 * GoogleReviewMetadata Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { GoogleReviewMetadata } from '@/core/value-objects/google-review-metadata.vo';

describe('GoogleReviewMetadata Value Object', () => {
  const validProps = {
    googleReviewId: 'review123',
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    reviewUrl: 'https://maps.google.com/reviews/review123',
  };

  describe('create', () => {
    it('should create valid metadata with required fields only', () => {
      const result = GoogleReviewMetadata.create(validProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.googleReviewId).toBe(validProps.googleReviewId);
        expect(result.data.googlePlaceId).toBe(validProps.googlePlaceId);
        expect(result.data.reviewUrl).toBe(validProps.reviewUrl);
        expect(result.data.authorGoogleId).toBeUndefined();
        expect(result.data.authorPhotoUrl).toBeUndefined();
        expect(result.data.photoUrl).toBeUndefined();
      }
    });

    it('should create valid metadata with all optional fields', () => {
      const propsWithOptionals = {
        ...validProps,
        authorGoogleId: 'author123',
        authorPhotoUrl: 'https://example.com/author.jpg',
        photoUrl: 'https://example.com/review.jpg',
      };

      const result = GoogleReviewMetadata.create(propsWithOptionals);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.authorGoogleId).toBe('author123');
        expect(result.data.authorPhotoUrl).toBe('https://example.com/author.jpg');
        expect(result.data.photoUrl).toBe('https://example.com/review.jpg');
      }
    });

    it('should fail when googleReviewId is missing', () => {
      const props = { ...validProps, googleReviewId: '' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Google Review ID is required');
      }
    });

    it('should fail when googleReviewId is whitespace only', () => {
      const props = { ...validProps, googleReviewId: '   ' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Google Review ID is required');
      }
    });

    it('should fail when googlePlaceId is missing', () => {
      const props = { ...validProps, googlePlaceId: '' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Google Place ID is required');
      }
    });

    it('should fail when googlePlaceId is whitespace only', () => {
      const props = { ...validProps, googlePlaceId: '   ' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Google Place ID is required');
      }
    });

    it('should fail when reviewUrl is missing', () => {
      const props = { ...validProps, reviewUrl: '' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Review URL is required');
      }
    });

    it('should fail when reviewUrl is invalid', () => {
      const props = { ...validProps, reviewUrl: 'not-a-url' };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Invalid review URL format');
      }
    });

    it('should fail when authorPhotoUrl is invalid', () => {
      const props = {
        ...validProps,
        authorPhotoUrl: 'not-a-url',
      };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Invalid author photo URL format');
      }
    });

    it('should fail when photoUrl is invalid', () => {
      const props = {
        ...validProps,
        photoUrl: 'not-a-url',
      };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleReviewMetadataError');
        expect(result.error.message).toContain('Invalid photo URL format');
      }
    });

    it('should accept valid HTTPS URLs', () => {
      const props = {
        ...validProps,
        reviewUrl: 'https://maps.google.com/review',
        authorPhotoUrl: 'https://example.com/author.jpg',
        photoUrl: 'https://example.com/photo.jpg',
      };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      const props = {
        ...validProps,
        reviewUrl: 'http://maps.google.com/review',
        authorPhotoUrl: 'http://example.com/author.jpg',
        photoUrl: 'http://example.com/photo.jpg',
      };
      const result = GoogleReviewMetadata.create(props);

      expect(result.success).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return googleReviewId', () => {
      const result = GoogleReviewMetadata.create(validProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.googleReviewId).toBe(validProps.googleReviewId);
      }
    });

    it('should return googlePlaceId', () => {
      const result = GoogleReviewMetadata.create(validProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.googlePlaceId).toBe(validProps.googlePlaceId);
      }
    });

    it('should return reviewUrl', () => {
      const result = GoogleReviewMetadata.create(validProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviewUrl).toBe(validProps.reviewUrl);
      }
    });

    it('should return undefined for optional fields when not provided', () => {
      const result = GoogleReviewMetadata.create(validProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.authorGoogleId).toBeUndefined();
        expect(result.data.authorPhotoUrl).toBeUndefined();
        expect(result.data.photoUrl).toBeUndefined();
      }
    });

    it('should return optional fields when provided', () => {
      const propsWithOptionals = {
        ...validProps,
        authorGoogleId: 'author123',
        authorPhotoUrl: 'https://example.com/author.jpg',
        photoUrl: 'https://example.com/photo.jpg',
      };
      const result = GoogleReviewMetadata.create(propsWithOptionals);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.authorGoogleId).toBe('author123');
        expect(result.data.authorPhotoUrl).toBe('https://example.com/author.jpg');
        expect(result.data.photoUrl).toBe('https://example.com/photo.jpg');
      }
    });
  });
});
