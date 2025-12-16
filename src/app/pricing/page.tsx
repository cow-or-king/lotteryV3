/**
 * PRICING PAGE
 * Page de tarification avec 3 plans et toggle mensuel/annuel
 * IMPORTANT: ZERO any types
 */

'use client';

import { Gift, Check, X, ArrowRight, Sparkles, Star, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Pricing data
  const starterPrice = isAnnual ? 23 : 29;
  const proPrice = isAnnual ? 79 : 99;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Gift className="w-7 h-7 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ReviewLottery</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-sm"
              >
                Démarrer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">
              14 jours d'essai gratuit - Sans carte bancaire
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Des tarifs transparents pour chaque étape de votre croissance
          </p>

          {/* Toggle Mensuel/Annuel */}
          <div className="inline-flex items-center gap-4 p-2 bg-white rounded-xl shadow-md border border-gray-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !isAnnual
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                isAnnual
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Starter */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600">Pour les petits commerces qui démarrent</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">{starterPrice}€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Économisez {(29 - 23) * 12}€/an
                  </p>
                )}
              </div>

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold text-center transition-all mb-8"
              >
                Commencer l'essai
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1 commerce</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">100 participations/mois</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Réponses IA (50/mois)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">2 types de jeux</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">QR codes illimités</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analytics de base</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support email</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Multi-commerces</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Analytics avancés</span>
                </div>
              </div>
            </div>

            {/* Plan Pro - Most Popular */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-600 p-8 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600">Pour les commerces en croissance</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-purple-600">{proPrice}€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Économisez {(99 - 79) * 12}€/an
                  </p>
                )}
              </div>

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition-all mb-8 shadow-lg"
              >
                Commencer l'essai
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">5 commerces</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">500 participations/mois</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Réponses IA illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Tous les jeux disponibles</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">QR codes illimités</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Analytics avancés</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Multi-commerces</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Support prioritaire</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">API access</span>
                </div>
              </div>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Pour les grandes enseignes</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">Sur devis</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Tarif personnalisé</p>
              </div>

              <Link
                href="#"
                className="block w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-center transition-all mb-8"
              >
                Nous contacter
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Commerces illimités</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Participations illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Réponses IA illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Tous les jeux personnalisables</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">White-label disponible</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analytics personnalisés</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Manager dédié</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support 24/7</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">SLA garanti 99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comparaison détaillée des fonctionnalités
            </h2>
            <p className="text-xl text-gray-600">Trouvez le plan qui correspond à vos besoins</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Fonctionnalité
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-purple-600">Pro</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Nombre de commerces</td>
                    <td className="px-6 py-4 text-center text-gray-900">1</td>
                    <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">5</td>
                    <td className="px-6 py-4 text-center text-gray-900">Illimité</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      Participations mensuelles
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">100</td>
                    <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">500</td>
                    <td className="px-6 py-4 text-center text-gray-900">Illimité</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Réponses IA</td>
                    <td className="px-6 py-4 text-center text-gray-900">50/mois</td>
                    <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">Illimité</td>
                    <td className="px-6 py-4 text-center text-gray-900">Illimité</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Types de jeux</td>
                    <td className="px-6 py-4 text-center text-gray-900">2</td>
                    <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">Tous</td>
                    <td className="px-6 py-4 text-center text-gray-900">Tous + Personnalisés</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">QR codes</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-purple-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Analytics avancés</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-purple-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">API access</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-purple-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">White-label</td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-purple-50">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Support</td>
                    <td className="px-6 py-4 text-center text-gray-900">Email</td>
                    <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">
                      Prioritaire
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">24/7 + Manager dédié</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Included */}
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

      {/* FAQ Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur nos tarifs</p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les
                changements sont effectifs immédiatement et la facturation est ajustée au prorata.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                L'essai gratuit nécessite-t-il une carte bancaire ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Non, vous pouvez commencer votre essai gratuit de 14 jours sans fournir de carte
                bancaire. Vous ne serez facturé qu'après avoir choisi un plan payant.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Que se passe-t-il si je dépasse mon quota de participations ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nous vous préviendrons par email lorsque vous atteindrez 80% de votre quota. Vous
                pourrez alors passer à un plan supérieur ou acheter des participations
                supplémentaires à la carte.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Proposez-vous des réductions pour les associations ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Oui, nous offrons des réductions de 30% pour les associations à but non lucratif et
                les organisations caritatives. Contactez-nous pour en savoir plus.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Puis-je annuler mon abonnement à tout moment ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de
                bord. Votre accès restera actif jusqu'à la fin de la période payée, sans
                renouvellement automatique.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Les tarifs incluent-ils toutes les fonctionnalités ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Oui, tous les tarifs incluent l'accès complet aux fonctionnalités de votre plan, les
                mises à jour, le support et l'hébergement. Aucun frais caché.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
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

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold text-gray-900">ReviewLottery</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <Link href="#" className="hover:text-purple-600 transition-colors">
                À propos
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Contact
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                CGU
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Mentions légales
              </Link>
            </div>
            <p className="text-gray-500">© 2025 ReviewLottery</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
