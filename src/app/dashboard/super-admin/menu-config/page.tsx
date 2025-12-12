/**
 * Page de gestion des menus visibles
 * Permet au Super-Admin de configurer la visibilité des menus par rôle
 * IMPORTANT: ZERO any types
 */

'use client';

import { useMenuConfig } from './hooks/useMenuConfig';
import { MenuConfigHeader } from './components/MenuConfigHeader';
import { MenuConfigTable } from './components/MenuConfigTable';

export default function MenuConfigPage() {
  const { isSuperAdmin, menuConfig, hasChanges, handleToggle, handleSave, handleReset } =
    useMenuConfig();

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <MenuConfigHeader hasChanges={hasChanges} onSave={handleSave} onReset={handleReset} />

      <MenuConfigTable menuConfig={menuConfig} onToggle={handleToggle} />

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
