'use client';

export function LoadingState() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 w-48 bg-purple-100/30 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6">
              <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
              <div className="h-4 w-full bg-purple-100/30 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-purple-100/30 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
