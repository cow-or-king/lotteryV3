/**
 * Composant d'écran pour campagne introuvable
 */

export function NotFoundScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-purple-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="text-center max-w-md mx-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Campagne introuvable</h1>
          <p className="text-gray-700">Cette campagne n'existe pas ou n'est plus active.</p>
        </div>
      </div>
    </div>
  );
}
