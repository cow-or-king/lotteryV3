/**
 * Dashboard Layout (Server Component)
 * Forces dynamic rendering for all dashboard pages
 * Wraps the client-side dashboard layout component
 */

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { DashboardClientLayout } from '@/components/layout/DashboardClientLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
