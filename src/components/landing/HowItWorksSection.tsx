/**
 * How it works timeline section
 */
export function HowItWorksSection() {
  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
          <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
            1
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">📝 Connectez-vous</h4>
          <p className="text-gray-700 text-sm">Avec votre compte Google</p>
        </div>

        <div className="hidden md:block text-gray-400 text-3xl">→</div>

        <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
          <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
            2
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">🎰 Jouez</h4>
          <p className="text-gray-700 text-sm">Tournez la roue</p>
        </div>

        <div className="hidden md:block text-gray-400 text-3xl">→</div>

        <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
          <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
            3
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">🎁 Gagnez</h4>
          <p className="text-gray-700 text-sm">Récupérez votre cadeau</p>
        </div>
      </div>
    </div>
  );
}
