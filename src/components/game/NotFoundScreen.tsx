/**
 * Campaign not found screen component
 */
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

export function NotFoundScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <GlassCard className="p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-bold text-white mb-4">Campagne introuvable</h1>
        <p className="text-white/70">Cette campagne n'existe pas ou n'est plus active.</p>
      </GlassCard>
    </div>
  );
}
