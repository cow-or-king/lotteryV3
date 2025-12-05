# Core Domain Layer

## Principe Fondamental
**AUCUNE dépendance externe** - Ce layer contient uniquement la logique métier pure.

## Structure
- `entities/` - Entités métier (User, Store, Campaign, etc.)
- `value-objects/` - Objets valeur (Email, Money, ClaimCode, etc.)
- `repositories/` - Interfaces des repositories (contrats uniquement)
- `services/` - Services du domaine (logique métier complexe)
- `errors/` - Erreurs métier personnalisées

## Règles
- ✅ TypeScript pur uniquement
- ✅ Aucun import de librairies externes
- ✅ Aucun type `any`
- ✅ Result Pattern pour la gestion d'erreurs
- ✅ Branded Types pour tous les IDs