---
name: mcp-server-typescript
description: Scaffolds and extends MCP servers in TypeScript using @modelcontextprotocol/sdk, Zod validation, and clean service-layer architecture. Use when building or extending an MCP server, adding tools, resources, or prompts.
---

# MCP Server TypeScript

## Installation

```bash
npm install @modelcontextprotocol/sdk zod
npm install -D typescript tsx @types/node
```

## Structure du projet

```
src/
├── server.ts           <- Point d'entrée
├── tools/
│   ├── index.ts        <- Export agrégé
│   └── user-tools.ts   <- Tools par domaine
├── resources/index.ts
├── prompts/index.ts
├── services/userService.ts
├── schemas/index.ts
└── types/index.ts
```

## Point d'entrée

```typescript
// src/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerUserTools } from './tools/user-tools.js';

const createServer = (): McpServer => {
  const server = new McpServer({ name: 'mon-serveur-mcp', version: '1.0.0' });
  registerUserTools(server);
  return server;
};

const main = async (): Promise<void> => {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server démarré');
};

main().catch(console.error);
```

## Tool avec validation Zod

```typescript
// src/tools/user-tools.ts
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const GetUserInput = z.object({
  id: z.string().uuid('ID doit être un UUID valide'),
});

export const registerUserTools = (server: McpServer): void => {
  server.registerTool(
    'get-user',
    {
      title: 'Récupérer un utilisateur',
      description: 'Récupère un utilisateur par son ID UUID',
      inputSchema: GetUserInput,
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

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true
  }
}
```

Pour HTTP transport, resources, et prompts : voir references/mcp-advanced.md
