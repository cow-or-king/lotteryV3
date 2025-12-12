/**
 * Hook pour la gestion de la configuration des menus
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { DEFAULT_MENU_CONFIG, MenuConfig } from '@/lib/rbac/menuConfig';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

export function useMenuConfig() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { toast } = useToast();
  const [menuConfig, setMenuConfig] = useState<MenuConfig[]>(DEFAULT_MENU_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  const utils = api.useUtils();
  const { data: dbPermissions } = api.menu.getPermissions.useQuery(undefined, {
    enabled: true,
  });
  const savePermissions = api.menu.savePermissions.useMutation({
    onSuccess: () => {
      utils.menu.getPermissions.invalidate();
    },
  });

  // Initialiser avec les permissions de la BD
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
      toast({
        title: 'Configuration sauvegardée',
        description: 'Les permissions ont été mises à jour avec succès',
        variant: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: 'Erreur de sauvegarde',
        description: `Vérifiez que la migration Prisma est effectuée. ${errorMessage}`,
        variant: 'error',
      });
    }
  };

  const handleReset = () => {
    setMenuConfig(DEFAULT_MENU_CONFIG);
    setHasChanges(false);
  };

  return {
    isSuperAdmin: isSuperAdmin(),
    menuConfig,
    hasChanges,
    handleToggle,
    handleSave,
    handleReset,
  };
}
