---
description: "Core coding standards: TypeScript strict, arrow functions, CSS Modules with Tailwind, file separation. Always applied."
alwaysApply: true
---

# Standards de code — Toujours actifs

## TypeScript strict

- `strict: true` dans `tsconfig.json` obligatoire
- Jamais de `any` sans commentaire justificatif
- Préférer `interface` pour les objets, `type` pour unions/intersections
- Typer les retours de fonctions explicitement

## Fonctions fléchées (OBLIGATOIRE)

Toutes les fonctions — composants, handlers, utilitaires, hooks — sont des fonctions fléchées typées.

```typescript
// Composant React
const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

// Fonction utilitaire
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Hook custom
const useCounter = (initial: number = 0): { count: number; increment: () => void } => {
  const [count, setCount] = React.useState(initial);
  const increment = (): void => setCount((prev) => prev + 1);
  return { count, increment };
};

// Handler async
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
};

// INTERDIT — function keyword
function Button({ label }) { ... }
```

## Séparation des fichiers — RÈGLE ABSOLUE

| Contexte | Styles | Script | Notes |
|---|---|---|---|
| HTML + Alpine.js | style.css séparé | app.js séparé | Jamais inline |
| React / Next.js | Component.module.css | Component.tsx | @apply Tailwind dans CSS |
| Node.js / API | — | *.ts fichiers dédiés | 1 responsabilité par fichier |

### CSS Modules avec Tailwind (@apply)

```css
/* Button.module.css */
.button {
  @apply px-4 py-2 rounded-lg font-semibold transition-colors duration-200;
}

.button--primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.button--secondary {
  @apply bg-gray-100 text-gray-800 hover:bg-gray-200;
}
```

```tsx
/* Button.tsx */
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary' }) => (
  <button className={`${styles.button} ${styles[`button--${variant}`]}`}>
    {label}
  </button>
);

// INTERDIT : className="px-4 py-2 text-white bg-blue-600"
// INTERDIT : style={{ color: 'red' }}
```

## Nommage

- Composants React : PascalCase → UserCard.tsx
- Hooks : use + PascalCase → useAuth.ts
- Utilitaires / services : camelCase → formatDate.ts, userService.ts
- Dossiers : kebab-case → user-profile/
- États : verbe auxiliaire → isLoading, hasError, canSubmit
- Constantes globales : SCREAMING_SNAKE_CASE → MAX_RETRY_COUNT

## Interdictions absolues

- style="" inline dans HTML
- Classes Tailwind directement dans JSX
- Balises style ou script dans un fichier HTML
- function keyword pour composants ou handlers
- var — utiliser const ou let
- any sans commentaire justificatif
- Fichiers > 300 lignes sans justification architecturale
