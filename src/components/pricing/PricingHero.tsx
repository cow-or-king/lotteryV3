/**
 * Pricing page hero section
 */
import { Sparkles } from 'lucide-react';
import { PricingToggle } from './PricingToggle';

interface PricingHeroProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingHero({ isAnnual, onToggle }: PricingHeroProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">
            14 jours d'essai gratuit - Sans carte bancaire
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Choisissez votre plan</h1>
        <p className="text-xl text-gray-600 mb-12">
          Des tarifs transparents pour chaque étape de votre croissance
        </p>

        <PricingToggle isAnnual={isAnnual} onToggle={onToggle} />
      </div>
    </section>
  );
}
