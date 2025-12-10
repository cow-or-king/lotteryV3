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
import { api } from '@/lib/trpc/client';

export default function MenuConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const [menuConfig, setMenuConfig] = useState<MenuConfig[]>(DEFAULT_MENU_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  // Récupérer les permissions depuis la BD
  const utils = api.useUtils();
  const { data: dbPermissions } = api.menu.getPermissions.useQuery(undefined, {
    enabled: true, // Table créée avec succès
  });
  const savePermissions = api.menu.savePermissions.useMutation({
    onSuccess: () => {
      // Invalider le cache pour forcer un refetch et mettre à jour la sidebar
      utils.menu.getPermissions.invalidate();
    },
  });

  // Initialiser avec les permissions de la BD si disponibles
  useEffect(() => {
    if (dbPermissions && dbPermissions.length > 0) {
      const mergedConfig = DEFAULT_MENU_CONFIG.map((menu) => {
        const dbPerm = dbPermissions.find((p) => p.menuId === menu.id);
        return dbPerm
          ? {
              ...menu,
              superAdminVisible: dbPerm.superAdminVisible,
              adminVisible: dbPerm.adminVisible,
              userVisible: dbPerm.userVisible,
            }
          : menu;
      });
      setMenuConfig(mergedConfig);
    }
  }, [dbPermissions]);

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

  const handleSave = async () => {
    try {
      // Préparer les données pour la sauvegarde
      const permissions = menuConfig.map((menu, index) => ({
        menuId: menu.id,
        label: menu.label,
        superAdminVisible: menu.superAdminVisible,
        adminVisible: menu.adminVisible,
        userVisible: menu.userVisible,
        displayOrder: index,
      }));

      await savePermissions.mutateAsync(permissions);
      setHasChanges(false);
      alert('✅ Configuration sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde. Vérifiez que la migration Prisma est effectuée.');
    }
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
            {menuConfig.map((menu) => {
              const isSuperAdminMenu = menu.targetRole === 'SUPER_ADMIN';
              return (
                <tr
                  key={menu.id}
                  style={{
                    borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
                    background: isSuperAdminMenu ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSuperAdminMenu) {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSuperAdminMenu
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div>
                      <p
                        style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#1f2937' }}
                      >
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
                        cursor: isSuperAdminMenu ? 'not-allowed' : 'pointer',
                        opacity: isSuperAdminMenu ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={menu.adminVisible}
                        onChange={() => handleToggle(menu.id, 'adminVisible')}
                        disabled={isSuperAdminMenu}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: isSuperAdminMenu ? 'not-allowed' : 'pointer',
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
                        cursor: isSuperAdminMenu ? 'not-allowed' : 'pointer',
                        opacity: isSuperAdminMenu ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={menu.userVisible}
                        onChange={() => handleToggle(menu.id, 'userVisible')}
                        disabled={isSuperAdminMenu}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: isSuperAdminMenu ? 'not-allowed' : 'pointer',
                          accentColor: '#9333ea',
                        }}
                      />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#1f2937', lineHeight: '1.6' }}>
          <strong>ℹ️ Fonctionnement:</strong> Les modifications sont sauvegardées en temps réel dans
          la base de données. La sidebar se met à jour automatiquement après chaque sauvegarde. Les
          routes SUPER_ADMIN (fond rouge) ne peuvent pas être partagées avec ADMIN/USER pour des
          raisons de sécurité.
        </p>
      </div>
    </div>
  );
}
