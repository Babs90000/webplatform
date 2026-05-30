---
name: react-typescript-coding
description: Generates React components, hooks, and utilities in TypeScript using arrow functions, CSS Modules with Tailwind @apply, and feature-based architecture. Use when creating React components, custom hooks, or TypeScript utilities.
---

# React + TypeScript — Patterns de génération

## Composant standard

```tsx
// ComponentName.tsx
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction, children }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {children}
      {onAction && (
        <button className={styles.button} onClick={onAction}>Action</button>
      )}
    </div>
  );
};

export default ComponentName;
```

```css
/* ComponentName.module.css */
.container {
  @apply flex flex-col gap-4 p-6 rounded-xl bg-white shadow-sm;
}

.title {
  @apply text-xl font-semibold text-gray-900;
}

.button {
  @apply px-4 py-2 rounded-lg bg-blue-600 text-white font-medium
         hover:bg-blue-700 transition-colors duration-200;
}
```

## Hook custom

```typescript
// useHookName.ts
import { useState, useEffect, useCallback } from 'react';

interface UseHookNameReturn {
  data: SomeType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useHookName = (param: string): UseHookNameReturn => {
  const [data, setData] = useState<SomeType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await someApiCall(param);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [param]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

export default useHookName;
```

## Règles de génération

- Toujours React.FC<Props> pour typer les composants
- Toujours useCallback pour les handlers passés en props
- Toujours useState<Type> avec le type explicite
- useEffect avec dépendances explicites et complètes
- Gestion d'erreur avec err instanceof Error
- Export default pour composants, named exports pour hooks/utils

Pour les patterns avancés (Context, Error Boundary, React Hook Form) : voir references/advanced-patterns.md
