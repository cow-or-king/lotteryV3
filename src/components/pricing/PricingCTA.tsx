/**
 * Final CTA section for pricing page
 */
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function PricingCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-purple-600 to-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Besoin d'aide pour choisir ?
        </h2>
        <p className="text-xl text-purple-100 mb-10">
          Notre équipe est là pour vous conseiller et trouver le plan idéal pour votre business
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-white hover:bg-gray-50 text-purple-600 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Commencer l'essai gratuit
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold text-lg border-2 border-white/20 transition-all"
          >
            Parler à un expert
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
