/**
 * Dashboard Layout
 * Layout partagé pour toutes les pages du dashboard
 * Contient la sidebar et le wrapper principal
 */

'use client';

import { api } from '@/lib/trpc/client';
import {
  Dices,
  Gift,
  LayoutDashboard,
  Loader2,
  Settings,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [userClosedSidebar, setUserClosedSidebar] = useState(false);
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);

  // Récupérer les infos utilisateur
  const { data: user, isLoading: userLoading } = api.auth.getMe.useQuery();

  // Déterminer le menu actif basé sur le pathname
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveMenu('dashboard');
    } else if (pathname.startsWith('/dashboard/stores')) {
      setActiveMenu('stores');
    } else if (pathname.startsWith('/dashboard/prizes')) {
      setActiveMenu('prizes');
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

  // Détecter la taille d'écran au montage
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCompactMode(true);
        if (!userClosedSidebar) {
          setIsSidebarOpen(true);
        }
      } else {
        setIsCompactMode(false);
        setIsSidebarOpen(true);
        setUserClosedSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userClosedSidebar]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/trpc/auth.logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      id: 'stores',
      icon: <Store className="w-5 h-5" />,
      label: 'Mes Commerces',
      path: '/dashboard/stores',
    },
    {
      id: 'prizes',
      icon: <Gift className="w-5 h-5" />,
      label: 'Gains & Lots',
      path: '/dashboard/prizes',
    },
    {
      id: 'campaigns',
      icon: <Target className="w-5 h-5" />,
      label: 'Campagnes',
      path: '/campaigns',
    },
    { id: 'lottery', icon: <Dices className="w-5 h-5" />, label: 'Lottery', path: '/lottery' },
    {
      id: 'participants',
      icon: <Users className="w-5 h-5" />,
      label: 'Participants',
      path: '/participants',
    },
    {
      id: 'analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Analytics',
      path: '/analytics',
    },
    {
      id: 'settings',
      icon: <Settings className="w-5 h-5" />,
      label: 'Paramètres',
      path: '/settings',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'white',
        position: 'relative',
      }}
    >
      {/* Loading Bar */}
      {isPending && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #9333ea, #ec4899)',
            zIndex: 9999,
            animation: 'loading-bar 1s ease-in-out infinite',
          }}
        />
      )}

      {/* Blobs animés */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '-20%',
            width: '400px',
            height: '400px',
            background: '#d8b4fe',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.3,
            animation: 'blob 7s infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: '#fbcfe8',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.3,
            animation: 'blob 7s infinite 2s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '20%',
            width: '400px',
            height: '400px',
            background: '#bfdbfe',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.3,
            animation: 'blob 7s infinite 4s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '20%',
            width: '400px',
            height: '400px',
            background: '#fef08a',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.3,
            animation: 'blob 7s infinite 6s',
          }}
        />
      </div>
      {/* Overlay pour mobile quand sidebar est ouverte */}
      {isSidebarOpen && !isCompactMode && (
        <div
          onClick={() => {
            setIsSidebarOpen(false);
            setUserClosedSidebar(true);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
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
          // borderRight: '1px solid rgba(147, 51, 234, 0.1)',
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
                    setIsSidebarOpen(false);
                    setUserClosedSidebar(true);
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
                padding: isCompactMode ? '14px 8px' : '14px 16px',
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
                  if (!isCompactMode) {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = '#4b5563';
                  e.currentTarget.style.transform = 'translateX(0)';
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

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? (isCompactMode ? '80px' : '280px') : '0',
          padding: '15px',
          paddingLeft: isSidebarOpen ? '0' : '15px',
          paddingRight: isSidebarOpen ? '5px' : '15px',
          overflowY: 'auto',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Content wrapper avec gradient et coins arrondis */}
        <div
          style={{
            minHeight: 'calc(100vh - 40px)',
            background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: 'clamp(16px, 3vw, 20px)',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          }}
          className="dashboard-content-wrapper"
        >
          {/* Navbar with User Info and Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px',
            }}
          >
            {/* User Info Card with integrated toggle button */}
            <div
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                borderRadius: '12px',
                padding: 'clamp(12px, 2vw, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Toggle Button */}
              <button
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                  setUserClosedSidebar(!isSidebarOpen);
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(147, 51, 234, 0.2)',
                  borderRadius: '10px',
                  color: '#4b5563',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                  e.currentTarget.style.color = '#9333ea';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
                  e.currentTarget.style.color = '#4b5563';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSidebarOpen ? '✕' : '☰'}
              </button>

              {/* User Avatar */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
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
                    fontSize: 'clamp(13px, 2.5vw, 15px)',
                    fontWeight: '600',
                    color: '#1f2937',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userLoading ? '...' : user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(10px, 1.8vw, 11px)',
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userLoading ? '...' : user?.email || ''}
                </p>
              </div>

              {/* Colonne droite: Plan et Limites (centrés) */}
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
                    padding: '4px 12px',
                    background: 'rgba(147, 51, 234, 0.15)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '8px',
                    fontSize: 'clamp(10px, 2vw, 12px)',
                    color: '#7c3aed',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {userLoading ? '...' : user?.subscription?.plan || 'FREE'}
                </div>
                <div
                  style={{
                    fontSize: 'clamp(9px, 1.8vw, 10px)',
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
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* CSS pour responsive et animations */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% {
            transform: scaleX(0);
            transform-origin: left;
          }
          50% {
            transform: scaleX(1);
            transform-origin: left;
          }
          51% {
            transform: scaleX(1);
            transform-origin: right;
          }
          100% {
            transform: scaleX(0);
            transform-origin: right;
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        html {
          height: -webkit-fill-available;
          background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%);
        }

        body {
          min-height: 100vh;
          min-height: -webkit-fill-available;
          background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%);
        }

        @media (max-width: 374px) {
          .dashboard-content-wrapper {
            border-radius: 12px !important;
            padding: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-overlay {
            display: block !important;
          }

          .toggle-compact-btn {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 16px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 834px) {
          .mobile-overlay {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 20px !important;
          }
        }

        @media (min-width: 835px) and (max-width: 1024px) {
          .mobile-overlay {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 24px !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-overlay {
            display: none !important;
          }
        }

        @media (min-width: 1920px) {
          .dashboard-content-wrapper {
            max-width: 1800px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) and (orientation: landscape) {
          .dashboard-content-wrapper {
            border-radius: 12px !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
