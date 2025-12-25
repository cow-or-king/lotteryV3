/**
 * Layout for games pages
 * Force dynamic rendering for all games pages
 */

export const dynamic = 'force-dynamic';

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
