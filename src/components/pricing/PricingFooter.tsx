/**
 * Footer for pricing page
 */
import { Gift } from 'lucide-react';
import Link from 'next/link';

export function PricingFooter() {
  return (
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
  );
}
