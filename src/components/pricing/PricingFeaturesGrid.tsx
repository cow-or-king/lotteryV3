/**
 * All features included grid section
 */
import { Shield, Zap, Star, Sparkles } from 'lucide-react';

export function PricingFeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Toutes les fonctionnalités incluses
          </h2>
          <p className="text-xl text-gray-600">
            Des outils puissants disponibles dans tous les plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">100% Conforme</h3>
            <p className="text-gray-600">Respect des conditions Google</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Automatisation</h3>
            <p className="text-gray-600">Campagnes automatisées</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-jeux</h3>
            <p className="text-gray-600">Roue, cartes, slots</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Personnalisation</h3>
            <p className="text-gray-600">Votre marque, votre style</p>
          </div>
        </div>
      </div>
    </section>
  );
}
