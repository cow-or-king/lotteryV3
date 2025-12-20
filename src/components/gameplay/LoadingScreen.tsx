/**
 * Composant d'écran de chargement pour le gameplay
 */

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-800 text-lg font-medium">Chargement du jeu...</p>
      </div>
    </div>
  );
}
