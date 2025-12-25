/**
 * Error screen for landing page
 */
import { AnimatedBackground } from './AnimatedBackground';

interface LandingErrorScreenProps {
  error?: unknown;
}

export function LandingErrorScreen({ error }: LandingErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      <AnimatedBackground />
      <div className="text-center max-w-md mx-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error ? 'Erreur' : 'Aucune campagne active'}
          </h1>
          <p className="text-gray-700">
            {error
              ? 'Une erreur est survenue. Veuillez réessayer.'
              : "Ce commerce n'a pas de campagne active pour le moment."}
          </p>
        </div>
      </div>
    </div>
  );
}
