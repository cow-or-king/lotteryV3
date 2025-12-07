/**
 * Loading State for Stores Page
 * Skeleton UI pendant le chargement
 */

export default function StoresLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-purple-100/30 rounded mb-2"></div>
          <div className="h-4 w-64 bg-purple-100/30 rounded"></div>
        </div>
        <div className="h-12 w-48 bg-purple-100/30 rounded-xl animate-pulse"></div>
      </div>

      {/* Stores Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100/30 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 w-32 bg-purple-100/30 rounded"></div>
              </div>
            </div>
            <div className="h-4 w-full bg-purple-100/30 rounded mb-2"></div>
            <div className="h-3 w-24 bg-purple-100/30 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-600/20">
              <div>
                <div className="h-3 w-16 bg-purple-100/30 rounded mb-1"></div>
                <div className="h-6 w-8 bg-purple-100/30 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-20 bg-purple-100/30 rounded mb-1"></div>
                <div className="h-6 w-8 bg-purple-100/30 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
