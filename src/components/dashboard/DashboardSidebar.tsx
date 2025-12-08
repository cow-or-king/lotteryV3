/**
 * DashboardSidebar Component
 * Sidebar du dashboard avec navigation et menu utilisateur
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuId } from '@/hooks/dashboard/useSidebar';
import {
  Dices,
  Gift,
  LayoutDashboard,
  Loader2,
  Settings,
  Star,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';

interface User {
  name?: string | null;
  email?: string | null;
  subscription?: {
    plan?: string | null;
    storesLimit?: number | null;
  } | null;
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  isCompactMode: boolean;
  activeMenu: MenuId;
  setActiveMenu: (menu: MenuId) => void;
  closeSidebar: () => void;
  user: User | undefined | null;
  userLoading: boolean;
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

const menuItems = [
  {
    id: 'dashboard' as MenuId,
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    id: 'stores' as MenuId,
    icon: <Store className="w-5 h-5" />,
    label: 'Mes Commerces',
    path: '/dashboard/stores',
  },
  {
    id: 'reviews' as MenuId,
    icon: <Star className="w-5 h-5" />,
    label: 'Avis Google',
    path: '/dashboard/reviews',
  },
  {
    id: 'prizes' as MenuId,
    icon: <Gift className="w-5 h-5" />,
    label: 'Gains & Lots',
    path: '/dashboard/prizes',
  },
  {
    id: 'campaigns' as MenuId,
    icon: <Target className="w-5 h-5" />,
    label: 'Campagnes',
    path: '/campaigns',
  },
  {
    id: 'lottery' as MenuId,
    icon: <Dices className="w-5 h-5" />,
    label: 'Lottery',
    path: '/lottery',
  },
  {
    id: 'participants' as MenuId,
    icon: <Users className="w-5 h-5" />,
    label: 'Participants',
    path: '/participants',
  },
  {
    id: 'analytics' as MenuId,
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Analytics',
    path: '/analytics',
  },
  {
    id: 'settings' as MenuId,
    icon: <Settings className="w-5 h-5" />,
    label: 'Paramètres',
    path: '/settings',
  },
];

export function DashboardSidebar({
  isSidebarOpen,
  isCompactMode,
  activeMenu,
  setActiveMenu,
  closeSidebar,
  user,
  userLoading,
  isLoggingOut,
  handleLogout,
}: DashboardSidebarProps) {
  const [, startTransition] = useTransition();
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);

  return (
    <div
      style={{
        width: isCompactMode ? '80px' : '280px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        minHeight: '-webkit-fill-available',
        left: isSidebarOpen ? 0 : isCompactMode ? '-80px' : '-280px',
        top: 0,
        bottom: 0,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: isCompactMode ? '10px 0' : '30px 24px',
          textAlign: isCompactMode ? 'center' : 'left',
        }}
      >
        {isCompactMode ? (
          <div style={{ fontSize: '32px', margin: 0 }}>🎲</div>
        ) : (
          <>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
              }}
            >
              🎲 ReviewLottery
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
              v3.0 - Admin Panel
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{ flex: 1, padding: isCompactMode ? '20px 8px' : '20px 12px', overflowY: 'auto' }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            prefetch={true}
            onClick={() => {
              startTransition(() => {
                setActiveMenu(item.id);
                if (window.innerWidth < 768 && !isCompactMode) {
                  closeSidebar();
                }
              });
            }}
            title={isCompactMode ? item.label : ''}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompactMode ? 'center' : 'flex-start',
              gap: '12px',
              margin: '5px 0',
              padding: isCompactMode ? '10px 8px' : '10px 16px',
              background: activeMenu === item.id ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
              border:
                activeMenu === item.id
                  ? '1px solid rgba(147, 51, 234, 0.3)'
                  : '1px solid transparent',
              borderRadius: '12px',
              color: activeMenu === item.id ? '#9333ea' : '#4b5563',
              cursor: 'pointer',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '15px',
              fontWeight: activeMenu === item.id ? '600' : '500',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.15)';
                e.currentTarget.style.color = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#4b5563';
              }
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isCompactMode ? '36px' : '32px',
                height: isCompactMode ? '36px' : '32px',
                background:
                  activeMenu === item.id
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
                    : 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                border:
                  activeMenu === item.id
                    ? '1px solid rgba(147, 51, 234, 0.4)'
                    : '1px solid rgba(147, 51, 234, 0.2)',
                borderRadius: '10px',
                transition: 'all 0.3s',
                color: activeMenu === item.id ? '#9333ea' : '#a855f7',
              }}
            >
              {item.icon}
            </div>
            {!isCompactMode && <span>{item.label}</span>}
            {activeMenu === item.id && !isCompactMode && (
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  width: '4px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                  borderRadius: '2px',
                }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: isCompactMode ? '12px 8px' : '20px',
          borderTop: '1px solid rgba(147, 51, 234, 0.15)',
          background: 'rgba(255, 255, 255, 0.2)',
          marginBottom: '28px',
        }}
      >
        {!isCompactMode && (
          <>
            {/* User Info Card (cliquable) */}
            <button
              onClick={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: isUserMenuExpanded ? '8px' : '0',
                border: `1px solid rgba(147, 51, 234, ${isUserMenuExpanded ? '0.4' : '0.2'})`,
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.borderColor = `rgba(147, 51, 234, ${isUserMenuExpanded ? '0.4' : '0.2'})`;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
                {/* Colonne gauche: Nom et Email */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userLoading
                      ? '...'
                      : user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userLoading ? '...' : user?.email || ''}
                  </p>
                </div>
                {/* Colonne droite: Plan et Limites */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      padding: '2px 8px',
                      background: 'rgba(147, 51, 234, 0.15)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '6px',
                      fontSize: '10px',
                      color: '#7c3aed',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {userLoading ? '...' : user?.subscription?.plan || 'FREE'}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                    }}
                  >
                    {userLoading
                      ? '...'
                      : `${user?.subscription?.storesLimit || 1} store${(user?.subscription?.storesLimit || 1) > 1 ? 's' : ''}`}
                  </div>
                </div>
                {/* Icône chevron */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    transition: 'transform 0.3s',
                    transform: isUserMenuExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  ▼
                </div>
              </div>
            </button>

            {/* Menu déroulant */}
            {isUserMenuExpanded && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {/* Bouton Réglages */}
                <Link
                  href="/settings"
                  onClick={() => {
                    startTransition(() => {
                      setActiveMenu('settings');
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    borderRadius: '8px',
                    color: '#7c3aed',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Réglages
                </Link>

                {/* Bouton Déconnexion */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#dc2626',
                    cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    opacity: isLoggingOut ? 0.5 : 1,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }
                  }}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Déconnexion...
                    </>
                  ) : (
                    <>🚪 Se déconnecter</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Mode compact - Bouton simple */}
        {isCompactMode && (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Se déconnecter"
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#dc2626',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '18px',
              opacity: isLoggingOut ? 0.5 : 1,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }
            }}
          >
            {isLoggingOut ? '...' : '🚪'}
          </button>
        )}
      </div>
    </div>
  );
}
