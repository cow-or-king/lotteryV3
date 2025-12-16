/**
 * HOME STYLE 2 - BOLD/DYNAMIQUE
 * Page d'accueil avec design vibrant et énergique
 * IMPORTANT: ZERO any types
 */

import {
  Gift,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  ArrowRight,
  Users,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function HomeBoldPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Gradient Background */}
      <header className="bg-linear-to-r from-purple-600 to-blue-600 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-white">ReviewLottery</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3 text-white hover:text-purple-100 font-bold transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105"
              >
                Démarrer Maintenant
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Pattern Background */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-600 via-purple-500 to-blue-600 overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8 animate-pulse">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-bold text-white">+10 000 avis générés ce mois-ci</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
            Transformez vos clients
            <br />
            en <span className="text-yellow-300">ambassadeurs</span>
          </h1>

          <p className="text-2xl text-purple-100 mb-12 max-w-3xl mx-auto font-semibold">
            La plateforme N°1 pour booster vos avis Google avec des loteries gamifiées et
            l'intelligence artificielle
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/login"
              className="px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-2xl font-black text-xl shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-110"
            >
              Commencer GRATUITEMENT
            </Link>
            <button className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-xl border-2 border-white transition-all hover:scale-105">
              Voir la Démo
            </button>
          </div>
        </div>
      </section>

      {/* Features Cards with Heavy Shadows */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Des fonctionnalités <span className="text-purple-600">explosives</span>
            </h2>
            <p className="text-2xl text-gray-600 font-bold">
              Tout ce dont vous avez besoin pour dominer vos avis Google
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Bold Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">IA Super-Intelligente</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Générez des réponses ultra-personnalisées qui reflètent parfaitement votre marque
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Loteries Gamifiées</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Roues de la fortune, cartes à gratter, slots - vos clients vont adorer jouer !
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-green-400 to-green-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Croissance Explosive</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Augmentez vos avis de +300% en moyenne en seulement 3 mois
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Automatisation Totale</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Configurez une fois, laissez tourner pour toujours. Zéro effort continu !
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-red-400 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-red-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Analytics en Temps Réel</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Dashboards ultra-détaillés pour piloter vos performances comme un pro
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105">
                <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">100% Sécurisé</h3>
                <p className="text-gray-700 text-lg font-semibold">
                  Conforme Google, RGPD et toutes les réglementations. Dormez tranquille !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Colored Avatars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Ils nous font <span className="text-purple-600">confiance</span>
            </h2>
            <p className="text-2xl text-gray-600 font-bold">
              Rejoignez des centaines de commerces satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 bg-linear-to-br from-purple-50 to-blue-50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  MC
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">Marie Cuisine</div>
                  <div className="text-purple-600 font-bold">Restaurant</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg font-semibold">
                "Nos avis ont explosé ! +250% en 2 mois. L'équipe adore la roue de la fortune !"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-linear-to-br from-blue-50 to-green-50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  JD
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">Jean Dupont</div>
                  <div className="text-blue-600 font-bold">Salon de coiffure</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg font-semibold">
                "Interface ultra-intuitive. Mes clients adorent jouer pour gagner des réductions !"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-linear-to-br from-green-50 to-yellow-50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  SB
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">Sophie Beauté</div>
                  <div className="text-green-600 font-bold">Institut beauté</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg font-semibold">
                "ROI incroyable ! L'automatisation me fait gagner 10h par semaine minimum."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Colorful Badges */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-600 via-purple-500 to-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-12">
            Pourquoi ReviewLottery ?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20">
              <div className="text-4xl font-black text-white mb-2">98%</div>
              <div className="text-purple-100 font-bold text-lg">Taux de satisfaction</div>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20">
              <div className="text-4xl font-black text-white mb-2">+300%</div>
              <div className="text-purple-100 font-bold text-lg">Avis en moyenne</div>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20">
              <div className="text-4xl font-black text-white mb-2">24/7</div>
              <div className="text-purple-100 font-bold text-lg">Support disponible</div>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20">
              <div className="text-4xl font-black text-white mb-2">10k+</div>
              <div className="text-purple-100 font-bold text-lg">Avis générés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <div className="text-5xl font-black text-white mb-3 animate-pulse">500+</div>
              <div className="text-gray-400 text-xl font-bold">Commerces actifs</div>
            </div>
            <div>
              <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <div className="text-5xl font-black text-white mb-3 animate-pulse">4.9★</div>
              <div className="text-gray-400 text-xl font-bold">Note moyenne</div>
            </div>
            <div>
              <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <div className="text-5xl font-black text-white mb-3 animate-pulse">10 000+</div>
              <div className="text-gray-400 text-xl font-bold">Avis ce mois-ci</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with Gradient */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-purple-600 via-purple-500 to-blue-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Prêt à EXPLOSER vos avis ?
          </h2>
          <p className="text-2xl text-purple-100 mb-12 font-bold">
            Commencez GRATUITEMENT aujourd'hui. Aucune carte bancaire requise.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-12 py-6 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-110"
          >
            DÉMARRER MAINTENANT
            <ArrowRight className="w-8 h-8" />
          </Link>
          <p className="mt-6 text-purple-200 font-semibold">
            Rejoignez 500+ commerces qui cartonnent avec ReviewLottery
          </p>
        </div>
      </section>

      {/* Footer Multi-Columns */}
      <footer className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black text-white">ReviewLottery</span>
              </div>
              <p className="text-gray-400 font-semibold">
                La plateforme N°1 pour booster vos avis Google
              </p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h3 className="text-white font-black text-lg mb-4">Produit</h3>
              <ul className="space-y-3 text-gray-400 font-semibold">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Démo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h3 className="text-white font-black text-lg mb-4">Entreprise</h3>
              <ul className="space-y-3 text-gray-400 font-semibold">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Carrières
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Legal */}
            <div>
              <h3 className="text-white font-black text-lg mb-4">Légal</h3>
              <ul className="space-y-3 text-gray-400 font-semibold">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 font-semibold">
              © 2025 ReviewLottery. Tous droits réservés. Made with ❤️ in France
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
