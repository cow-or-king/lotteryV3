/**
 * Layout for game configuration pages
 * Force dynamic rendering for all pages using useSearchParams
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function ConfigureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
