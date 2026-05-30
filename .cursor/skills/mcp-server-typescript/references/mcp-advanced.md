# MCP Server — Patterns avancés

## Transport HTTP

```typescript
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const app = express();
app.use(express.json());

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

app.post('/mcp', async (req, res) => transport.handleRequest(req, res, req.body));
app.listen(3000);
await server.connect(transport);
```

## Resource MCP

```typescript
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

server.registerResource(
  'user-profile',
  new ResourceTemplate('users://{id}/profile', { list: undefined }),
  { title: 'Profil utilisateur', description: 'Profil complet' },
  async (uri, { id }) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(await userService.findById(String(id))),
      mimeType: 'application/json',
    }],
  }),
);
```

## Helpers de réponse standardisés

```typescript
// utils/mcpResponse.ts
export const mcpError = (message: string) => ({
  content: [{ type: 'text' as const, text: `Erreur: ${message}` }],
  isError: true,
});

export const mcpSuccess = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});
```
