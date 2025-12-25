/**
 * Campaign Landing Page via QR Code - Refactored
 * Page d'atterrissage quand un utilisateur scanne le QR code par défaut d'un store
 * Route: /c/[shortCode]
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useParams } from 'next/navigation';
import { useGameSession } from '@/hooks/landing/useGameSession';
import { useGoogleAuth } from '@/hooks/landing/useGoogleAuth';
import { LandingLoadingScreen } from '@/components/landing/LandingLoadingScreen';
import { LandingErrorScreen } from '@/components/landing/LandingErrorScreen';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { LandingHero } from '@/components/landing/LandingHero';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { WhyParticipateSection } from '@/components/landing/WhyParticipateSection';
import { CTASection } from '@/components/landing/CTASection';

export default function QRCodeLandingPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;

  // Récupérer le QRCode, le Store et la campagne active via une seule query
  const { data, isLoading, error } = api.qrCode.getActiveCampaignByShortCode.useQuery(
    { shortCode },
    { enabled: !!shortCode },
  );

  // Check for existing game session and redirect if needed
  useGameSession({
    campaignId: data?.campaign?.id,
    enabled: !!data?.campaign,
  });

  // Handle Google OAuth
  const { handleStartGame: handleGoogleAuth } = useGoogleAuth();

  const handleStartGame = () => {
    if (data?.campaign) {
      handleGoogleAuth(data.campaign.id);
    }
  };

  // Loading state
  if (isLoading) {
    return <LandingLoadingScreen />;
  }

  // Error state or no active campaign
  if (error || !data?.campaign) {
    return <LandingErrorScreen error={error} />;
  }

  const { campaign, store } = data;

  // Main landing page
  return (
    <div className="min-h-screen p-4 relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      <AnimatedBackground />

      <div className="max-w-4xl w-full py-8 mx-auto">
        <LandingHero storeName={store.name} description={campaign.description} />
        <HowItWorksSection />
        <WhyParticipateSection />
        <CTASection onStartGame={handleStartGame} />
      </div>
    </div>
  );
}
