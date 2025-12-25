/**
 * Pricing page header
 */
import { Gift } from 'lucide-react';
import Link from 'next/link';

export function PricingHeader() {
  return (
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
  );
}
