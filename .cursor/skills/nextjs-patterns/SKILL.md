---
name: nextjs-patterns
description: Generates Next.js App Router code with Server Components, Server Actions, API routes, middleware, and metadata in TypeScript. Use when working on Next.js projects, creating pages, layouts, server components, or API routes.
---

# Next.js App Router — Patterns TypeScript

## Règle fondamentale : Server vs Client

- Server Component (défaut) = pas de useState, useEffect, onClick
- Client Component ('use client') = interactivité, hooks React

## Page — Server Component async

```tsx
// app/users/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UserProfile } from '@/features/users/components/UserProfile';
import { userService } from '@/services/userService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;
  const user = await userService.findById(id);
  return { title: user?.name ?? 'Utilisateur introuvable' };
};

const UserPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await userService.findById(id);
  if (!user) notFound();
  return <UserProfile user={user} />;
};

export default UserPage;
```

## Server Action

```tsx
// app/users/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const updateUser = async (
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> => {
  const parsed = UpdateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.message };
  await userService.update(id, parsed.data);
  revalidatePath(`/users/${id}`);
  return { success: true };
};
```

## Composant Client

```tsx
// features/users/components/UserForm.tsx
'use client';
import { useTransition } from 'react';
import { updateUser } from '@/app/users/actions';
import styles from './UserForm.module.css';

interface UserFormProps {
  userId: string;
  defaultValues: { name: string; email: string };
}

const UserForm: React.FC<UserFormProps> = ({ userId, defaultValues }) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => { await updateUser(userId, formData); });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <button type="submit" disabled={isPending} className={styles.submit}>
        {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </form>
  );
};
```

## Route API

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const GET = async (_request: NextRequest): Promise<NextResponse> => {
  const users = await userService.findAll();
  return NextResponse.json(users);
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const body = await request.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await userService.create(parsed.data);
  return NextResponse.json(user, { status: 201 });
};
```

## Quand utiliser quoi ?

| Besoin | Solution |
|---|---|
| Afficher des données | Server Component async |
| Bouton/formulaire interactif | Client Component 'use client' |
| Mutation de données | Server Action 'use server' |
| Endpoint JSON externe | Route Handler app/api/ |
| Auth/redirect global | Middleware |
| SEO dynamique | generateMetadata |
