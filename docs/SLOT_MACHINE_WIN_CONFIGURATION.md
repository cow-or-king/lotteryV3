# Configuration des Résultats Gagnants - Machine à Sous

## 📋 Vue d'ensemble

Les résultats gagnants de la machine à sous sont configurés via les **Win Patterns** dans le fichier `src/lib/types/game-design.types.ts`.

## 🎯 Patterns de Gain (Win Patterns)

### Structure d'un Win Pattern

```typescript
export interface SlotWinPattern {
  pattern: string[]; // Combinaison de symboles gagnants
  multiplier: number; // Multiplicateur de gain
}
```

### Exemples de Configuration

#### Configuration Classique (3 rouleaux)

```typescript
winPatterns: [
  { pattern: ['🍒', '🍒', '🍒'], multiplier: 10 }, // 3 cerises = x10
  { pattern: ['🍋', '🍋', '🍋'], multiplier: 20 }, // 3 citrons = x20
  { pattern: ['🍊', '🍊', '🍊'], multiplier: 30 }, // 3 oranges = x30
  { pattern: ['🍇', '🍇', '🍇'], multiplier: 40 }, // 3 raisins = x40
  { pattern: ['💎', '💎', '💎'], multiplier: 50 }, // 3 diamants = x50
  { pattern: ['⭐', '⭐', '⭐'], multiplier: 100 }, // 3 étoiles = JACKPOT x100
];
```

#### Configuration Deluxe (5 rouleaux)

```typescript
winPatterns: [
  { pattern: ['7️⃣', '7️⃣', '7️⃣', '7️⃣', '7️⃣'], multiplier: 777 }, // 5x 7 = MEGA JACKPOT
  { pattern: ['💰', '💰', '💰', '💰', '💰'], multiplier: 100 }, // 5 sacs d'argent
  { pattern: ['💎', '💎', '💎', '💎', '💎'], multiplier: 75 }, // 5 diamants
  { pattern: ['🍀', '🍀', '🍀', '🍀', '🍀'], multiplier: 50 }, // 5 trèfles
];
```

## 🎲 Configuration des Symboles

### Structure d'un Symbole

```typescript
export interface SlotSymbol {
  id: string; // Identifiant unique
  icon: string; // Emoji ou URL d'image
  value: number; // Valeur en points
  color: string; // Couleur associée
}
```

### Exemple de Symboles

```typescript
symbols: [
  { id: '1', icon: '🍒', value: 10, color: '#EF4444' }, // Cerise - Rouge
  { id: '2', icon: '🍋', value: 20, color: '#F59E0B' }, // Citron - Orange
  { id: '3', icon: '🍊', value: 30, color: '#F97316' }, // Orange - Orange foncé
  { id: '4', icon: '🍇', value: 40, color: '#8B5CF6' }, // Raisin - Violet
  { id: '5', icon: '💎', value: 50, color: '#3B82F6' }, // Diamant - Bleu
  { id: '6', icon: '⭐', value: 100, color: '#FBBF24' }, // Étoile - Or
];
```

## 🔧 Comment Configurer les Gains

### 1. Via le Configurateur (Interface)

1. Aller sur `/dashboard/games/configure/slot`
2. Section **"Symboles"**:
   - Ajouter/Modifier les symboles disponibles
   - Définir leur valeur en points
   - Choisir leur couleur

3. Section **"Patterns de Gain"** (à venir):
   - Définir les combinaisons gagnantes
   - Configurer les multiplicateurs

### 2. Via le Code (Avancé)

Modifier directement dans `src/lib/types/game-design.types.ts`:

```typescript
export const DEFAULT_SLOT_MACHINE_DESIGNS: Record<string, SlotMachineDesignConfig> = {
  classic: {
    name: 'Machine à sous classique',
    reelsCount: 3,
    symbolsPerReel: 3,
    backgroundColor: '#1F2937',
    reelBorderColor: '#FFD700',

    // 1. Définir les symboles disponibles
    symbols: [
      { id: '1', icon: '🍒', value: 10, color: '#EF4444' },
      { id: '2', icon: '🍋', value: 20, color: '#F59E0B' },
      { id: '3', icon: '🍊', value: 30, color: '#F97316' },
      { id: '4', icon: '🍇', value: 40, color: '#8B5CF6' },
      { id: '5', icon: '💎', value: 50, color: '#3B82F6' },
      { id: '6', icon: '⭐', value: 100, color: '#FBBF24' },
    ],

    // 2. Configurer les patterns de gain
    winPatterns: [
      { pattern: ['🍒', '🍒', '🍒'], multiplier: 10 },
      { pattern: ['🍋', '🍋', '🍋'], multiplier: 20 },
      { pattern: ['🍊', '🍊', '🍊'], multiplier: 30 },
      { pattern: ['🍇', '🍇', '🍇'], multiplier: 40 },
      { pattern: ['💎', '💎', '💎'], multiplier: 50 },
      { pattern: ['⭐', '⭐', '⭐'], multiplier: 100 },
    ],

    // 3. Paramètres d'animation
    spinDuration: 3000, // Durée du spin en ms
    spinEasing: 'EASE_OUT', // Type d'animation
    reelDelay: 200, // Délai entre chaque rouleau
  },
};
```

## 🎰 Logique de Détection des Gains

### Implémentation Actuelle (Preview)

Dans `src/components/games/SlotMachinePreview.tsx`:

```typescript
const checkWin = (symbols: string[]) => {
  // Check if all symbols match
  const allMatch = symbols.every((s) => s === symbols[0]);
  if (allMatch) {
    setShowWin(true);
  }
};
```

### Implémentation Avancée (Backend)

Pour la version production, implémenter dans le backend:

```typescript
function checkSlotWin(
  finalSymbols: string[],
  winPatterns: SlotWinPattern[],
): { isWin: boolean; pattern?: SlotWinPattern; prize?: number } {
  // Vérifier chaque pattern de gain
  for (const winPattern of winPatterns) {
    if (isPatternMatch(finalSymbols, winPattern.pattern)) {
      return {
        isWin: true,
        pattern: winPattern,
        prize: baseBet * winPattern.multiplier,
      };
    }
  }

  return { isWin: false };
}

function isPatternMatch(symbols: string[], pattern: string[]): boolean {
  if (symbols.length !== pattern.length) return false;

  return symbols.every((symbol, index) => symbol === pattern[index]);
}
```

## 💰 Exemples de Stratégies de Gain

### 1. **Stratégie Progressive**

Gains augmentent avec la rareté:

```typescript
winPatterns: [
  { pattern: ['🍒', '🍒', '🍒'], multiplier: 5 }, // Commun
  { pattern: ['🍋', '🍋', '🍋'], multiplier: 10 }, // Peu commun
  { pattern: ['🍊', '🍊', '🍊'], multiplier: 25 }, // Rare
  { pattern: ['💎', '💎', '💎'], multiplier: 100 }, // Très rare
  { pattern: ['⭐', '⭐', '⭐'], multiplier: 500 }, // Jackpot
];
```

### 2. **Stratégie à 5 Rouleaux**

Patterns partiels + patterns complets:

```typescript
winPatterns: [
  // Patterns partiels (3 sur 5)
  { pattern: ['7️⃣', '7️⃣', '7️⃣', '?', '?'], multiplier: 10 },

  // Patterns de 4
  { pattern: ['💰', '💰', '💰', '💰', '?'], multiplier: 50 },

  // Patterns complets (5 sur 5)
  { pattern: ['7️⃣', '7️⃣', '7️⃣', '7️⃣', '7️⃣'], multiplier: 777 },
];
```

## 🎯 Probabilités et Équilibrage

### Calcul des Probabilités

Pour un jeu équitable:

```typescript
// Nombre total de combinaisons possibles
const totalCombinations = Math.pow(symbols.length, reelsCount);

// Probabilité d'un pattern spécifique
const probability = 1 / totalCombinations;

// Pour 3 rouleaux avec 6 symboles: 1/216 = 0.46%
// Pour 5 rouleaux avec 6 symboles: 1/7776 = 0.01%
```

### Recommendations d'Équilibrage

```typescript
// 3 Rouleaux (6 symboles)
symbols: 6,
totalCombinations: 216,
recommendedWinRate: '10-15%', // 21-32 patterns gagnants

// 5 Rouleaux (6 symboles)
symbols: 6,
totalCombinations: 7776,
recommendedWinRate: '5-8%',  // 388-622 patterns gagnants
```

## 📊 Suivi et Analytics

Pour suivre les performances:

```typescript
interface SlotGameResult {
  userId: string;
  gameId: string;
  symbols: string[];
  isWin: boolean;
  pattern?: SlotWinPattern;
  prize: number;
  betAmount: number;
  timestamp: Date;
}
```

## 🔐 Sécurité

⚠️ **Important**: Les résultats doivent être générés côté **backend** pour éviter la triche:

```typescript
// ❌ MAUVAIS - Frontend
const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

// ✅ BON - Backend avec seed cryptographique
const randomSymbol = await generateSecureRandomSymbol(symbols, userId, timestamp);
```

## 📚 Ressources

- **Types**: `src/lib/types/game-design.types.ts`
- **Preview**: `src/components/games/SlotMachinePreview.tsx`
- **Config Page**: `src/app/dashboard/games/configure/slot/page.tsx`
- **Default Designs**: `DEFAULT_SLOT_MACHINE_DESIGNS` in game-design.types.ts
