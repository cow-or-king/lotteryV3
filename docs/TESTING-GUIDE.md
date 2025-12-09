# 🧪 Guide de Test - ReviewLottery V3

**Date:** 9 Décembre 2024
**Version:** 3.0

---

## 📚 Table des Matières

1. [Configuration](#configuration)
2. [Tests Composants UI](#tests-composants-ui)
3. [Tests Hooks](#tests-hooks)
4. [Tests Use Cases](#tests-use-cases)
5. [Corriger les Erreurs TypeScript](#corriger-les-erreurs-typescript)
6. [Exemples Complets](#exemples-complets)

---

## Configuration

### Stack de Test

- **Vitest** - Framework de test (compatible Jest)
- **@testing-library/react** - Tests composants React
- **@testing-library/react-hooks** - Tests hooks React
- **Playwright** - Tests E2E

### Lancer les Tests

```bash
# Tests unitaires
npm run test                # Lance tous les tests
npm run test:ui             # Interface graphique
npm run test:coverage       # Avec coverage
npm run test:watch          # Mode watch

# Tests E2E
npm run test:e2e            # Lance Playwright
npm run test:e2e:ui         # Interface Playwright
npm run test:e2e:debug      # Mode debug
```

---

## Tests Composants UI

### Pattern de Base

```typescript
/**
 * ComponentName.test.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Exemple Complet : ReviewCard

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';
import { ReviewDTO } from '@/lib/types/review.types';

describe('ReviewCard', () => {
  const mockReview: ReviewDTO = {
    reviewId: '123',
    googleReviewId: 'google-123',
    authorName: 'John Doe',
    rating: 5,
    comment: 'Great service!',
    publishedAt: '2024-01-15T10:00:00Z',
    hasResponse: false,
    isVerified: true,
    status: 'PENDING',
    sentiment: 'POSITIVE',
    needsAttention: false,
    isPositive: true,
  };

  it('renders author name', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders comment', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('Great service!')).toBeInTheDocument();
  });

  it('shows correct status badge', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });
});
```

---

## Tests Hooks

### Pattern de Base

```typescript
/**
 * useHookName.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHookName } from './useHookName';

// Mock dependencies
vi.mock('@/lib/trpc/client', () => ({
  api: {
    // ... mocks
  },
}));

describe('useHookName', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.value).toBe('expected');
  });
});
```

### Exemple Complet : useReviews

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReviews } from './useReviews';
import { api } from '@/lib/trpc/client';

vi.mock('@/lib/trpc/client', () => ({
  api: {
    review: {
      getStats: { useQuery: vi.fn() },
      listByStore: { useQuery: vi.fn() },
      sync: { useMutation: vi.fn() },
    },
    useUtils: vi.fn(),
  },
}));

describe('useReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.useUtils as any).mockReturnValue({
      review: {
        getStats: { invalidate: vi.fn() },
        listByStore: { invalidate: vi.fn() },
      },
    });
  });

  it('fetches stats when storeId provided', () => {
    const mockStats = { total: 100, avgRating: 4.5 };

    (api.review.getStats.useQuery as any).mockReturnValue({
      data: mockStats,
      isLoading: false,
    });

    (api.review.listByStore.useQuery as any).mockReturnValue({
      data: { reviews: [] },
      isLoading: false,
    });

    (api.review.sync.useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useReviews({ storeId: 'store-123' }));

    expect(result.current.stats).toEqual(mockStats);
  });
});
```

---

## Tests Use Cases

### Pattern de Base

```typescript
/**
 * use-case-name.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UseCaseName } from './use-case-name';

describe('UseCaseName', () => {
  let useCase: UseCaseName;
  let mockRepository: MockType;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new UseCaseName(mockRepository);
  });

  it('executes successfully', async () => {
    const result = await useCase.execute({ param: 'value' });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('fails when validation error', async () => {
    const result = await useCase.execute({ param: '' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## Corriger les Erreurs TypeScript

### Problème 1 : Property 'first' does not exist on type 'Promise<void>'

**Erreur dans Playwright tests:**

```typescript
// ❌ INCORRECT
await page.getByText('Mon texte').first();

// ✅ CORRECT
await page.getByText('Mon texte').first.click();
```

**Solution:**

```typescript
// Option 1: Utiliser nth(0) au lieu de first()
await page.getByText('Mon texte').nth(0).click();

// Option 2: Utiliser locator
const element = page.locator('text=Mon texte').first();
await element.click();
```

### Problème 2 : Type 'X' is not assignable to type 'Mock'

**Erreur dans tests unitaires:**

```typescript
// ❌ INCORRECT
mockService as any as { method: Mock };

// ✅ CORRECT
import { vi, type Mock } from 'vitest';

const mockService = {
  method: vi.fn(),
} as { method: Mock };
```

### Problème 3 : Argument of type 'string' is not assignable to parameter of type 'Email'

**Erreur avec Branded Types:**

```typescript
// ❌ INCORRECT
useCase.execute({ email: 'test@example.com' });

// ✅ CORRECT
import { Email } from '@/lib/types/branded.type';

const email = 'test@example.com' as Email;
useCase.execute({ email });
```

### Problème 4 : Object is possibly 'undefined'

**Erreur avec propriétés optionnelles:**

```typescript
// ❌ INCORRECT
const value = result.data.property;

// ✅ CORRECT - Option 1: Optional chaining
const value = result.data?.property;

// ✅ CORRECT - Option 2: Null assertion (si sûr)
const value = result.data!.property;

// ✅ CORRECT - Option 3: Guard clause
if (!result.data) throw new Error('No data');
const value = result.data.property;
```

---

## Exemples Complets

### Test Composant avec User Interaction

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Test Hook avec Async

```typescript
import { describe, it, expect, vi, waitFor } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('loads data asynchronously', async () => {
    const { result } = renderHook(() => useAsyncData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Test Use Case avec Repository Mock

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateStoreUseCase } from './create-store.use-case';
import type { IStoreRepository } from '@/core/repositories/store.repository.interface';

describe('CreateStoreUseCase', () => {
  let useCase: CreateStoreUseCase;
  let mockRepo: IStoreRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(Result.ok(undefined)),
      findById: vi.fn(),
      // ... autres méthodes
    } as unknown as IStoreRepository;

    useCase = new CreateStoreUseCase(mockRepo);
  });

  it('creates store successfully', async () => {
    const result = await useCase.execute({
      name: 'Test Store',
      brandId: 'brand-123' as BrandId,
    });

    expect(result.success).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

---

## 🎯 Checklist Tests

### Avant de Committer

- [ ] Tous les tests passent (`npm run test`)
- [ ] TypeScript sans erreurs (`npm run type-check`)
- [ ] Coverage > 70% sur nouveau code
- [ ] Pas de `any` types dans les tests
- [ ] Mocks correctement typés
- [ ] Tests E2E mis à jour si UI modifiée

### Bonnes Pratiques

1. **Un test = Une assertion principale**
2. **Noms descriptifs** : `it('should create store when valid data')`
3. **AAA Pattern** : Arrange, Act, Assert
4. **Mock minimal** : Mocker uniquement les dépendances externes
5. **Branded Types** : Utiliser les types du projet
6. **Result Pattern** : Tester success ET failure

---

## 📖 Ressources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)

---

**Dernière mise à jour:** 9 Décembre 2024
**Version:** 3.0
