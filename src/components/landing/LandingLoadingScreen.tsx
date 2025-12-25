/**
 * Loading screen for landing page
 */
import { AnimatedBackground } from './AnimatedBackground';

export function LandingLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      <AnimatedBackground />
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-800 text-lg font-medium">Chargement...</p>
      </div>
    </div>
  );
}
