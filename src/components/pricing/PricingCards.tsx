/**
 * Pricing cards section
 */
import { PricingCard } from './PricingCard';

interface PricingCardsProps {
  isAnnual: boolean;
}

export function PricingCards({ isAnnual }: PricingCardsProps) {
  const starterPrice = isAnnual ? 23 : 29;
  const proPrice = isAnnual ? 79 : 99;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <PricingCard
            name="Starter"
            description="Pour les petits commerces qui démarrent"
            price={starterPrice}
            savings={isAnnual ? `Économisez ${(29 - 23) * 12}€/an` : undefined}
            ctaText="Commencer l'essai"
            ctaHref="/login"
            ctaVariant="secondary"
            features={[
              { text: '1 commerce', included: true },
              { text: '100 participations/mois', included: true },
              { text: 'Réponses IA (50/mois)', included: true },
              { text: '2 types de jeux', included: true },
              { text: 'QR codes illimités', included: true },
              { text: 'Analytics de base', included: true },
              { text: 'Support email', included: true },
              { text: 'Multi-commerces', included: false },
              { text: 'Analytics avancés', included: false },
            ]}
          />

          {/* Pro Plan */}
          <PricingCard
            name="Pro"
            description="Pour les commerces en croissance"
            price={proPrice}
            savings={isAnnual ? `Économisez ${(99 - 79) * 12}€/an` : undefined}
            ctaText="Commencer l'essai"
            ctaHref="/login"
            ctaVariant="primary"
            highlighted
            badge="Most Popular"
            features={[
              { text: '5 commerces', included: true, emphasized: true },
              { text: '500 participations/mois', included: true, emphasized: true },
              { text: 'Réponses IA illimitées', included: true, emphasized: true },
              { text: 'Tous les jeux disponibles', included: true, emphasized: true },
              { text: 'QR codes illimités', included: true, emphasized: true },
              { text: 'Analytics avancés', included: true, emphasized: true },
              { text: 'Multi-commerces', included: true, emphasized: true },
              { text: 'Support prioritaire', included: true, emphasized: true },
              { text: 'API access', included: true, emphasized: true },
            ]}
          />

          {/* Enterprise Plan */}
          <PricingCard
            name="Enterprise"
            description="Pour les grandes enseignes"
            price="Sur devis"
            period=""
            savings="Tarif personnalisé"
            ctaText="Nous contacter"
            ctaHref="#"
            ctaVariant="tertiary"
            features={[
              { text: 'Commerces illimités', included: true },
              { text: 'Participations illimitées', included: true },
              { text: 'Réponses IA illimitées', included: true },
              { text: 'Tous les jeux personnalisables', included: true },
              { text: 'White-label disponible', included: true },
              { text: 'Analytics personnalisés', included: true },
              { text: 'Manager dédié', included: true },
              { text: 'Support 24/7', included: true },
              { text: 'SLA garanti 99.9%', included: true },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
