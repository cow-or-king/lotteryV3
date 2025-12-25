/**
 * Why participate benefits section
 */
export function WhyParticipateSection() {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl mb-10">
      <div className="bg-linear-to-r from-purple-600 to-pink-600 p-3 text-white rounded-t-3xl">
        <h2 className="text-2xl font-bold text-white text-center">Pourquoi participer ?</h2>
      </div>

      <div className="space-y-4 p-4">
        <div
          className="flex items-start gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <svg
            className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-gray-700 text-lg">100% de chances de gagner un prize</p>
        </div>
        <div
          className="flex items-start gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <svg
            className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-gray-700 text-lg">Cadeaux et réductions exclusifs</p>
        </div>
        <div
          className="flex items-start gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <svg
            className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-gray-700 text-sm">Simple et rapide</p>
        </div>
      </div>
    </div>
  );
}
