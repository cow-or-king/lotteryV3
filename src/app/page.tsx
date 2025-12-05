/**
 * ReviewLottery v3.0 - Page d'accueil temporaire
 * IMPORTANT: Respecte les règles strictes du projet
 * - AUCUN type 'any'
 * - Types explicites partout
 * - Architecture hexagonale
 */

export default function HomePage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ReviewLottery v3.0
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Professional SaaS - Hexagonal Architecture - Zero Any Types
        </p>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded">
            TypeScript Ultra-Strict ✓
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded">
            Result Pattern ✓
          </div>
          <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded">
            Domain-Driven Design ✓
          </div>
        </div>
      </main>
    </div>
  );
}
