/**
 * Landing Page - Connect & Boost
 * Page publique d'accueil du site
 * IMPORTANT: ZERO any types
 */

import { Gift, Shield, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      {/* Header / Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image src="/badge.png" alt="Connect & Boost" width={40} height={40} />
              <span className="text-2xl font-bold bg-gradient-to-r from-cb-yellow via-cb-magenta to-cb-cyan bg-clip-text text-transparent">
                Connect & Boost
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Démarrer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">
              Transformez vos avis en engagement client
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connectez et Boostez
            <br />
            votre{' '}
            <span className="bg-gradient-to-r from-cb-yellow via-cb-magenta to-cb-cyan bg-clip-text text-transparent">
              engagement client
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect & Boost combine gamification et stratégies d'engagement pour transformer vos
            interactions client en expériences mémorables et booster votre croissance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Essayer gratuitement
            </Link>
            <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-lg transition-all shadow-md border border-gray-200">
              Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-gray-600">
              Une plateforme complète pour gérer vos avis et fidéliser vos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Réponses IA intelligentes</h3>
              <p className="text-gray-600">
                Générez des réponses personnalisées à vos avis Google avec l'IA, dans le ton de
                votre marque.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Loteries gamifiées</h3>
              <p className="text-gray-600">
                Créez des campagnes de loterie avec roulettes, cartes à gratter et codes QR pour vos
                clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestion multi-commerces</h3>
              <p className="text-gray-600">
                Gérez tous vos établissements depuis un seul tableau de bord centralisé.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics avancés</h3>
              <p className="text-gray-600">
                Suivez vos performances en temps réel avec des statistiques détaillées et des
                insights actionnables.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automatisation complète</h3>
              <p className="text-gray-600">
                Automatisez vos campagnes, vérifications d'avis et distributions de prix.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% conforme</h3>
              <p className="text-gray-600">
                Respect total des conditions d'utilisation de Google et des réglementations en
                vigueur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à transformer vos avis en opportunités ?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Rejoignez les commerces qui boostent leur réputation avec ReviewLottery
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white hover:bg-gray-50 text-purple-600 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">ReviewLottery</span>
          </div>
          <p className="text-gray-600 mb-4">
            La plateforme intelligente pour gérer vos avis et fidéliser vos clients
          </p>
          <p className="text-sm text-gray-500">© 2025 ReviewLottery. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
