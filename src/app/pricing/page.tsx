/**
 * PRICING PAGE - Refactored
 * Page de tarification avec 3 plans et toggle mensuel/annuel
 * IMPORTANT: ZERO any types
 */

'use client';

import { usePricingToggle } from '@/hooks/pricing/usePricingToggle';
import { PricingHeader } from '@/components/pricing/PricingHeader';
import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingCards } from '@/components/pricing/PricingCards';
import { PricingComparisonTable } from '@/components/pricing/PricingComparisonTable';
import { PricingFeaturesGrid } from '@/components/pricing/PricingFeaturesGrid';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingCTA } from '@/components/pricing/PricingCTA';
import { PricingFooter } from '@/components/pricing/PricingFooter';

export default function PricingPage() {
  const { isAnnual, setIsAnnual } = usePricingToggle();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30">
      <PricingHeader />
      <PricingHero isAnnual={isAnnual} onToggle={setIsAnnual} />
      <PricingCards isAnnual={isAnnual} />
      <PricingComparisonTable />
      <PricingFeaturesGrid />
      <PricingFAQ />
      <PricingCTA />
      <PricingFooter />
    </div>
  );
}
