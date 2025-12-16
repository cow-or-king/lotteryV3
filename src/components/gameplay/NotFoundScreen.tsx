/**
 * Composant d'écran pour campagne introuvable
 */

export function NotFoundScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-700 to-gray-900">
      <div className="text-center text-white max-w-md mx-4">
        <h1 className="text-3xl font-bold mb-4">Campagne introuvable</h1>
        <p className="text-gray-300">Cette campagne n'existe pas ou n'est plus active.</p>
      </div>
    </div>
  );
}
