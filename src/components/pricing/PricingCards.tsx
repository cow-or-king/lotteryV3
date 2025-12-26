/**
 * Pricing cards section
 * Connected to database via tRPC
 */
import { PricingCard } from './PricingCard';
import { api } from '@/lib/trpc/client';

interface PricingCardsProps {
  isAnnual: boolean;
}

export function PricingCards({ isAnnual }: PricingCardsProps) {
  const { data: plans, isLoading } = api.pricing.list.useQuery();

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-white/50 backdrop-blur-sm rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const monthlyPrice = plan.monthlyPrice;
            const annualPrice = plan.annualPrice;
            const displayPrice = isAnnual ? annualPrice : monthlyPrice;

            let price: string | number = 'Sur devis';
            let savings: string | undefined;
            let period = '/mois';

            if (displayPrice !== null) {
              price = displayPrice;
              if (isAnnual && monthlyPrice && annualPrice) {
                const yearlySavings = (monthlyPrice - annualPrice) * 12;
                savings = `Économisez ${yearlySavings}€/an`;
              }
            } else {
              period = '';
              savings = 'Tarif personnalisé';
            }

            const features = plan.features.map((f) => ({
              text: f.text,
              included: f.isIncluded,
              emphasized: f.isEmphasized,
            }));

            const ctaVariant =
              plan.slug === 'pro' ? 'primary' : plan.slug === 'starter' ? 'secondary' : 'tertiary';

            return (
              <PricingCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                price={price}
                period={period}
                savings={savings}
                ctaText={plan.ctaText}
                ctaHref={plan.ctaHref}
                ctaVariant={ctaVariant}
                highlighted={plan.isPopular}
                badge={plan.badgeText || undefined}
                features={features}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
