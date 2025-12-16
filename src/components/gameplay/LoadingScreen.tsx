/**
 * Composant d'écran de chargement pour le gameplay
 */

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-500 to-pink-500">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
        <p className="mt-4 text-white text-lg">Chargement du jeu...</p>
      </div>
    </div>
  );
}
