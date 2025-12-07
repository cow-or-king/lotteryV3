/**
 * Loading State for Dashboard
 * Skeleton UI pendant le chargement des pages
 */

export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-purple-100/30 rounded-xl mb-4"></div>
            <div className="h-4 w-24 bg-purple-100/30 rounded mb-2"></div>
            <div className="h-8 w-32 bg-purple-100/30 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white/40 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 mb-6">
        <div className="h-6 w-48 bg-purple-100/30 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-purple-100/30 rounded"></div>
          <div className="h-4 w-3/4 bg-purple-100/30 rounded"></div>
          <div className="h-4 w-5/6 bg-purple-100/30 rounded"></div>
        </div>
      </div>
    </div>
  );
}
