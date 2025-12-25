/**
 * Pricing comparison table
 */
import { Check, X } from 'lucide-react';

export function PricingComparisonTable() {
  return (
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
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Starter</th>
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
                  <td className="px-6 py-4 text-gray-700 font-medium">Participations mensuelles</td>
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
                  <td className="px-6 py-4 text-center text-gray-900 bg-purple-50">Prioritaire</td>
                  <td className="px-6 py-4 text-center text-gray-900">24/7 + Manager dédié</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
