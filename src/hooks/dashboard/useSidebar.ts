/**
 * useSidebar Hook
 * Gère l'état et la logique de la sidebar du dashboard
 * IMPORTANT: ZERO any types
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export type MenuId =
  | 'super-admin'
  | 'dashboard'
  | 'stores'
  | 'reviews'
  | 'prizes'
  | 'qr-codes'
  | 'campaigns'
  | 'winners'
  | 'lottery'
  | 'participants'
  | 'analytics'
  | 'settings';

export function useSidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [userClosedSidebar, setUserClosedSidebar] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard');

  // Déterminer le menu actif basé sur le pathname
  useEffect(() => {
    if (pathname.startsWith('/dashboard/super-admin')) {
      setActiveMenu('super-admin');
    } else if (pathname === '/dashboard') {
      setActiveMenu('dashboard');
    } else if (pathname.startsWith('/dashboard/stores')) {
      setActiveMenu('stores');
    } else if (pathname.startsWith('/dashboard/reviews')) {
      setActiveMenu('reviews');
    } else if (pathname.startsWith('/dashboard/prizes')) {
      setActiveMenu('prizes');
    } else if (pathname.startsWith('/dashboard/qr-codes')) {
      setActiveMenu('qr-codes');
    } else if (pathname.startsWith('/dashboard/campaigns')) {
      setActiveMenu('campaigns');
    } else if (pathname.startsWith('/dashboard/winners')) {
      setActiveMenu('winners');
    } else if (pathname.startsWith('/campaigns')) {
      setActiveMenu('campaigns');
    } else if (pathname.startsWith('/lottery')) {
      setActiveMenu('lottery');
    } else if (pathname.startsWith('/participants')) {
      setActiveMenu('participants');
    } else if (pathname.startsWith('/analytics')) {
      setActiveMenu('analytics');
    } else if (pathname.startsWith('/settings')) {
      setActiveMenu('settings');
    }
  }, [pathname]);

  // Gérer le mode responsive
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        setIsCompactMode(true);
        // ✅ FIX: Respecter toujours la préférence utilisateur
        // Si user a fermé, garder fermée même au resize (scroll iOS)
        if (userClosedSidebar) {
          setIsSidebarOpen(false);
        }
        // Ne rouvrir que si en haut de page ET que user n'a jamais fermé
        else if (window.scrollY === 0) {
          setIsSidebarOpen(true);
        }
      } else {
        // Desktop: toujours ouverte, reset préférence user
        setIsCompactMode(false);
        setIsSidebarOpen(true);
        setUserClosedSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userClosedSidebar]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setUserClosedSidebar(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setUserClosedSidebar(true);
  };

  return {
    isSidebarOpen,
    isCompactMode,
    activeMenu,
    setActiveMenu,
    toggleSidebar,
    closeSidebar,
  };
}
