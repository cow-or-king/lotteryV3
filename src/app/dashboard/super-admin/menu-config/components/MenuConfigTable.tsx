/**
 * Table de configuration des menus
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuConfig } from '@/lib/rbac/menuConfig';

interface MenuConfigTableProps {
  menuConfig: MenuConfig[];
  onToggle: (menuId: string, field: 'superAdminVisible' | 'adminVisible' | 'userVisible') => void;
}

export function MenuConfigTable({ menuConfig, onToggle }: MenuConfigTableProps) {
  return (
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
                      onChange={() => onToggle(menu.id, 'superAdminVisible')}
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
                      onChange={() => onToggle(menu.id, 'adminVisible')}
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
                      onChange={() => onToggle(menu.id, 'userVisible')}
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
  );
}
