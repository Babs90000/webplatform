---
description: "MCP and Node.js/React architecture: service layers, Zod validation, feature-based structure. Applied on server, api, mcp, services, lib files."
alwaysApply: false
globs: ["**/server/**/*.ts", "**/api/**/*.ts", "**/mcp/**/*.ts", "**/services/**/*.ts", "**/lib/**/*.ts", "**/repositories/**/*.ts"]
---

# Architecture MCP & Node.js/React

## Structure de projet MCP TypeScript

```
src/
├── server.ts               <- Point d'entrée MCP
├── tools/
│   ├── index.ts            <- Export agrégé des tools
│   └── user-tools.ts       <- Un fichier par domaine
├── resources/
│   └── index.ts
├── prompts/
│   └── index.ts
├── services/               <- Logique métier pure (sans HTTP, sans MCP)
│   └── userService.ts
├── repositories/           <- Accès données (DB, API externes)
│   └── userRepository.ts
├── schemas/                <- Schémas Zod partagés
│   └── userSchema.ts
├── types/                  <- Types TypeScript partagés
│   └── index.ts
└── utils/                  <- Fonctions pures utilitaires
    └── formatters.ts
```

## Structure de projet React par feature

```
src/
├── features/
│   └── auth/
│       ├── components/LoginForm/
│       │   ├── LoginForm.tsx
│       │   ├── LoginForm.module.css
│       │   └── index.ts
│       ├── hooks/useAuth.ts
│       ├── services/authApi.ts
│       └── types.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/
```

## Modèle MCP TypeScript standard

```typescript
// src/tools/user-tools.ts
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { userService } from '../services/userService.js';

const GetUserSchema = z.object({
  id: z.string().uuid('L ID doit être un UUID valide'),
});

export const registerUserTools = (server: McpServer): void => {
  server.registerTool(
    'get-user',
    {
      title: 'Récupérer un utilisateur',
      description: 'Récupère un utilisateur par son ID',
      inputSchema: GetUserSchema,
    },
    async ({ id }) => {
      try {
        const user = await userService.findById(id);
        if (!user) {
          return { content: [{ type: 'text', text: `Utilisateur ${id} introuvable` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        return { content: [{ type: 'text', text: `Erreur: ${message}` }], isError: true };
      }
    },
  );
};
```

## Couche Service — Logique métier pure

```typescript
// src/services/userService.ts
import type { User } from '../types/index.js';

interface UserService {
  findById: (id: string) => Promise<User | null>;
  create: (data: CreateUserDTO) => Promise<User>;
}

export const userService: UserService = {
  findById: async (id) => userRepository.findOne({ where: { id } }),
  create: async (data) => userRepository.save(data),
};
```

## Validation Zod — obligatoire sur toutes les entrées

```typescript
// src/schemas/userSchema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'moderator']),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;
```

## Règles d'architecture

- Services appelés par les tools MCP, jamais l'inverse
- Repositories appelés uniquement par les services
- Schémas Zod partagés entre MCP et REST si les deux existent
- Types TypeScript inférés depuis Zod avec z.infer
- Pas de logique métier dans un controller/tool directement
- Pas d'appels DB dans un composant React
