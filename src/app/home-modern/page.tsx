/**
 * HOME STYLE 1 - MODERNE/MINIMALISTE
 * Page d'accueil avec design épuré et moderne
 * IMPORTANT: ZERO any types
 */

import { Gift, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomeModernPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Simple */}
      <header className="border-b border-gray-100 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <Gift className="w-7 h-7 text-purple-600" />
              <span className="text-xl font-semibold text-gray-900">ReviewLottery</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-all"
              >
                Démarrer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Large Typography */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
            Avis Google
            <br />
            <span className="text-purple-600">simplifiés</span>
          </h1>

          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Une plateforme minimaliste pour transformer vos avis en opportunités de croissance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105"
            >
              Commencer gratuitement
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg font-semibold text-lg transition-all hover:scale-105">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid - Clean 3 Columns */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Tout en un seul endroit</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les outils essentiels pour gérer vos avis et fidéliser vos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group hover:scale-105 transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Réponses IA</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Des réponses personnalisées et intelligentes pour chaque avis client.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group hover:scale-105 transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Gift className="w-7 h-7 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loteries gamifiées</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Engagez vos clients avec des jeux interactifs et des récompenses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group hover:scale-105 transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics clairs</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Suivez vos performances avec des données précises et actionnables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps Horizontal */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Comment ça marche</h2>
            <p className="text-xl text-gray-600">Trois étapes simples pour commencer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Créez votre campagne</h3>
              <p className="text-gray-600 text-lg">
                Configurez votre loterie en quelques clics avec notre interface intuitive.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Partagez avec vos clients</h3>
              <p className="text-gray-600 text-lg">
                Diffusez votre campagne via QR codes, emails ou liens directs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Récoltez les avis</h3>
              <p className="text-gray-600 text-lg">
                Augmentez vos avis Google automatiquement et fidélisez vos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - 4 Key Numbers */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">10k+</div>
              <div className="text-gray-600 text-lg">Avis générés</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">98%</div>
              <div className="text-gray-600 text-lg">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">500+</div>
              <div className="text-gray-600 text-lg">Commerces</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">4.8★</div>
              <div className="text-gray-600 text-lg">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Simple */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-bold text-gray-900 mb-8">Prêt à commencer ?</h2>
          <p className="text-2xl text-gray-600 mb-12">
            Rejoignez des centaines de commerces qui transforment leurs avis en succès.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105"
          >
            Essayer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold text-gray-900">ReviewLottery</span>
            </div>
            <div className="flex gap-8 text-gray-600">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                À propos
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
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
