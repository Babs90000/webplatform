---
name: testing-typescript
description: Generates unit and integration tests for TypeScript, React, and Node.js/MCP code using Vitest and React Testing Library. Use when writing tests, setting up test suites, or achieving test coverage targets.
---

# Tests TypeScript — Vitest + React Testing Library

## Structure : fichiers de test côte à côte avec les sources

```
src/features/auth/
├── components/LoginForm/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── services/
    ├── authService.ts
    └── authService.test.ts
```

## Test de composant React

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('@/services/authService', () => ({
  authService: { login: vi.fn() },
}));

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche les champs email et mot de passe', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it('appelle authService.login avec les bonnes données lors du submit', async () => {
    const { authService } = await import('@/services/authService');
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ token: 'abc' });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    });
  });
});
```

## Test de hook custom

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('démarre à la valeur initiale', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('incrémente le compteur', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

## Test de service

```typescript
import { describe, it, expect } from 'vitest';
import { userService } from './userService';

describe('userService', () => {
  it('retourne null si utilisateur inexistant', async () => {
    const user = await userService.findById('id-inexistant');
    expect(user).toBeNull();
  });
});
```

## Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: { reporter: ['text', 'html'], threshold: { lines: 80 } },
  },
});
```
