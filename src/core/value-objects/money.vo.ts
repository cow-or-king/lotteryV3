/**
 * Money Value Object
 * Gestion monétaire précise avec currency
 */

import { Result } from '@/shared/types/result.type';

export class InvalidMoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoneyError';
  }
}

export type Currency = 'EUR' | 'USD' | 'GBP';

export class Money {
  private readonly amount: number;
  private readonly currency: Currency;

  private constructor(amount: number, currency: Currency) {
    this.amount = amount;
    this.currency = currency;
  }

  static create(amount: number, currency: Currency = 'EUR'): Result<Money, InvalidMoneyError> {
    if (amount < 0) {
      return Result.fail(new InvalidMoneyError('Amount cannot be negative'));
    }

    if (!Number.isFinite(amount)) {
      return Result.fail(new InvalidMoneyError('Amount must be a finite number'));
    }

    // Arrondir à 2 décimales pour éviter les problèmes de précision
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.ok(new Money(roundedAmount, currency));
  }

  static zero(currency: Currency = 'EUR'): Money {
    return new Money(0, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  add(other: Money): Result<Money, InvalidMoneyError> {
    if (this.currency !== other.currency) {
      return Result.fail(new InvalidMoneyError('Cannot add money with different currencies'));
    }

    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Result<Money, InvalidMoneyError> {
    if (this.currency !== other.currency) {
      return Result.fail(new InvalidMoneyError('Cannot subtract money with different currencies'));
    }

    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Result<Money, InvalidMoneyError> {
    return Money.create(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  format(): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(this.amount);
  }

  toString(): string {
    return this.format();
  }
}
