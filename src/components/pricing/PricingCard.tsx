/**
 * Individual pricing card component
 */
import { Check, X } from 'lucide-react';
import Link from 'next/link';

interface PricingFeature {
  text: string;
  included: boolean;
  emphasized?: boolean;
}

interface PricingCardProps {
  name: string;
  description: string;
  price: string | number;
  period?: string;
  savings?: string;
  features: PricingFeature[];
  ctaText: string;
  ctaHref: string;
  ctaVariant?: 'primary' | 'secondary' | 'tertiary';
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  description,
  price,
  period = '/mois',
  savings,
  features,
  ctaText,
  ctaHref,
  ctaVariant = 'secondary',
  highlighted = false,
  badge,
}: PricingCardProps) {
  const cardClasses = highlighted
    ? 'bg-white rounded-2xl shadow-2xl border-2 border-purple-600 p-8 relative transform md:scale-105'
    : 'bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow';

  const ctaClasses = {
    primary:
      'block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition-all shadow-lg',
    secondary:
      'block w-full px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold text-center transition-all',
    tertiary:
      'block w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-center transition-all',
  };

  return (
    <div className={cardClasses}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
          {badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          {typeof price === 'number' ? (
            <>
              <span
                className={`text-5xl font-bold ${highlighted ? 'text-purple-600' : 'text-gray-900'}`}
              >
                {price}€
              </span>
              <span className="text-gray-600">{period}</span>
            </>
          ) : (
            <span className="text-4xl font-bold text-gray-900">{price}</span>
          )}
        </div>
        {savings && <p className="text-sm text-green-600 font-semibold mt-1">{savings}</p>}
      </div>

      <Link href={ctaHref} className={ctaClasses[ctaVariant]}>
        {ctaText}
      </Link>

      <div className="space-y-4 mt-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <span
              className={`${
                feature.included
                  ? feature.emphasized
                    ? 'text-gray-700 font-semibold'
                    : 'text-gray-700'
                  : 'text-gray-400'
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
