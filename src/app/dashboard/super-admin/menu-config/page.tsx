/**
 * Page de gestion des menus visibles
 * Permet au Super-Admin de configurer la visibilité des menus par rôle
 * IMPORTANT: ZERO any types
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { DEFAULT_MENU_CONFIG, MenuConfig } from '@/lib/rbac/menuConfig';
import { Settings, Save, RotateCcw } from 'lucide-react';

export default function MenuConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const [menuConfig, setMenuConfig] = useState<MenuConfig[]>(DEFAULT_MENU_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  // Rediriger si pas SUPER_ADMIN
  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);

  if (!isSuperAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const handleToggle = (
    menuId: string,
    field: 'superAdminVisible' | 'adminVisible' | 'userVisible',
  ) => {
    setMenuConfig((prev) =>
      prev.map((menu) => (menu.id === menuId ? { ...menu, [field]: !menu[field] } : menu)),
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Sauvegarder dans la base de données via tRPC
    console.log('Configuration sauvegardée:', menuConfig);
    setHasChanges(false);
    alert('Configuration sauvegardée (en mémoire pour le moment)');
  };

  const handleReset = () => {
    setMenuConfig(DEFAULT_MENU_CONFIG);
    setHasChanges(false);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
            }}
          >
            <Settings size={24} color="white" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gestion des Menus
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Configurer la visibilité des menus par rôle
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              color: '#9333ea',
              fontWeight: '500',
              fontSize: '14px',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: hasChanges ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <RotateCcw size={16} />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: hasChanges
                ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                : 'rgba(147, 51, 234, 0.3)',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: hasChanges ? '0 4px 12px rgba(147, 51, 234, 0.3)' : 'none',
            }}
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Table des menus */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(147, 51, 234, 0.1)',
                borderBottom: '1px solid rgba(147, 51, 234, 0.2)',
              }}
            >
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                Menu
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  width: '150px',
                }}
              >
                Super Admin
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  width: '150px',
                }}
              >
                Admin
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  width: '150px',
                }}
              >
                User
              </th>
            </tr>
          </thead>
          <tbody>
            {menuConfig.map((menu) => (
              <tr
                key={menu.id}
                style={{
                  borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {menu.label}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{menu.path}</p>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={menu.superAdminVisible}
                      onChange={() => handleToggle(menu.id, 'superAdminVisible')}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#9333ea',
                      }}
                    />
                  </label>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={menu.adminVisible}
                      onChange={() => handleToggle(menu.id, 'adminVisible')}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#9333ea',
                      }}
                    />
                  </label>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={menu.userVisible}
                      onChange={() => handleToggle(menu.id, 'userVisible')}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#9333ea',
                      }}
                    />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#1f2937' }}>
          <strong>Note:</strong> Cette configuration est actuellement stockée en mémoire. Les
          modifications seront perdues au rechargement. La persistance en base de données sera
          implémentée prochainement via le modèle MenuPermission.
        </p>
      </div>
    </div>
  );
}
