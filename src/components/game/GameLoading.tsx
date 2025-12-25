/**
 * Loading screen component for game page
 */
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

export function GameLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <GlassCard className="p-8 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p className="mt-4 text-white text-lg font-medium">Chargement...</p>
      </GlassCard>
    </div>
  );
}
