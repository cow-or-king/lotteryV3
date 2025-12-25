/**
 * Landing page hero section
 */
interface LandingHeroProps {
  storeName: string;
  description?: string | null;
}

export function LandingHero({ storeName, description }: LandingHeroProps) {
  return (
    <>
      {/* Store Name */}
      <div className="text-center mb-6">
        <p className="text-gray-700 text-lg font-medium">{storeName}</p>
      </div>

      {/* Header Animated */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center mb-6 animate-float">
          <div className="w-28 h-28 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-5xl">🎁</span>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          Gagnez à <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            Coup Sûr
          </span>{' '}
          !
        </h1>
        <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
          {description || 'Participez et gagnez des cadeaux !'}
        </p>
      </div>
    </>
  );
}
