/**
 * Campaign Dates Value Object
 * Encapsulates all date-related logic for campaigns
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Immutable value object
 */

import { Result } from '@/lib/types/result.type';
import { InvalidCampaignDataError } from '../entities/campaign.entity';

export interface CampaignDatesProps {
  readonly startDate: Date;
  readonly endDate: Date;
}

/**
 * CampaignDates Value Object
 * Gère les dates de début et de fin des campagnes
 */
export class CampaignDates {
  private constructor(private readonly props: CampaignDatesProps) {}

  static create(startDate: Date, endDate: Date): Result<CampaignDates> {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return Result.fail(new InvalidCampaignDataError('Invalid start date'));
    }

    if (isNaN(end.getTime())) {
      return Result.fail(new InvalidCampaignDataError('Invalid end date'));
    }

    if (end <= start) {
      return Result.fail(new InvalidCampaignDataError('End date must be after start date'));
    }

    if (end < now) {
      return Result.fail(new InvalidCampaignDataError('End date cannot be in the past'));
    }

    return Result.ok(new CampaignDates({ startDate: start, endDate: end }));
  }

  static fromPersistence(startDate: Date, endDate: Date): CampaignDates {
    return new CampaignDates({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  /**
   * Checks if campaign has started
   */
  hasStarted(): boolean {
    return new Date() >= this.props.startDate;
  }

  /**
   * Checks if campaign has ended
   */
  hasEnded(): boolean {
    return new Date() > this.props.endDate;
  }

  /**
   * Checks if campaign is currently running (between start and end)
   */
  isRunning(): boolean {
    const now = new Date();
    return now >= this.props.startDate && now <= this.props.endDate;
  }

  /**
   * Returns duration in milliseconds
   */
  getDurationMs(): number {
    return this.props.endDate.getTime() - this.props.startDate.getTime();
  }

  /**
   * Returns duration in days
   */
  getDurationDays(): number {
    return Math.ceil(this.getDurationMs() / (1000 * 60 * 60 * 24));
  }

  toPersistence(): CampaignDatesProps {
    return { ...this.props };
  }
}
