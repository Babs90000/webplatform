# Webplatform Frontend

This is the Next.js 15 frontend for the Webplatform project, featuring a complete visual page builder, authentication, and project management.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS Modules
- **State Management**: Zustand (with DevTools & persist)
- **Data Fetching**: TanStack React Query
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library
- **Logging**: Pino (structured logging)

## 🎉 Recent Improvements

We've added significant improvements to the codebase:

✅ **Structured Logging** - Pino-based logging system with dev/prod modes
✅ **Error Handling** - Error Boundary + global error handler
✅ **Testing Infrastructure** - Vitest + Testing Library fully configured
✅ **Form Validation** - React Hook Form + Zod integration
✅ **Auto-save** - Debounced auto-saving with dirty state tracking
✅ **Undo/Redo** - History system for editor state
✅ **Export/Import** - JSON export/import for pages and projects
✅ **Accessibility** - ARIA labels, focus management, keyboard navigation
✅ **State Enhancement** - Zustand with DevTools and persist middleware
✅ **Environment Validation** - Zod-based env var validation

**→ See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed documentation**

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Setup environment:
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run tests
- `pnpm run test:ui` - Run tests with UI
- `pnpm run test:coverage` - Generate coverage report

## Project Structure
The project follows a **feature-based architecture** for strict separation of concerns:

- `src/features/auth` - Authentication (login, register)
- `src/features/projects` - Project management
- `src/features/pages` - Page management and tree
- `src/features/blocks` - Visual editor, canvas, blocks
- `src/features/editor` - Editor layout and UI
- `src/store` - Global state (Zustand)
- `src/lib` - Core utilities (API, logging, export/import, etc.)
- `src/shared` - Shared components and hooks
- `src/types` - Type definitions (synced with backend)
- `src/test` - Tests and test setup
- `src/middleware.ts` - Route protection middleware

## Quick Start Examples

### Using the Logger
```typescript
import { createLogger } from "@/lib/logger";

const logger = createLogger("MyModule");
logger.info({ message: "Info", userId: "123" });
logger.error({ error, message: "Error occurred" });
```

### Form with Validation
```typescript
import { useZodForm } from "@/shared/hooks/useZodForm";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { register, handleSubmit, formState: { errors } } = useZodForm({
  schema,
});
```

### Auto-save
```typescript
import { useAutoSave } from "@/shared/hooks/useAutoSave";

useAutoSave({
  onSave: async () => {
    await api.patch(`/pages/${pageId}`, data);
  },
  enabled: isDirty,
});
```

### Export/Import Pages
```typescript
import { exportPageAsJson, downloadJson } from "@/lib/exportImport";

const json = exportPageAsJson(page, blocks);
downloadJson(json, "page-backup.json");
```

### Undo/Redo in Editor
```typescript
const { undo, redo, canUndo, canRedo } = useEditorStore();

// Keyboard shortcuts can be added:
// Cmd+Z: undo()
// Cmd+Shift+Z: redo()
```

## Testing

Run tests:
```bash
pnpm run test              # Watch mode
pnpm run test:ui          # Interactive UI
pnpm run test:coverage    # Coverage report
```

Example tests are in:
- `src/test/store.test.ts` - Store/hook tests
- `src/test/button.test.tsx` - Component tests

## Error Handling

The app includes comprehensive error handling:

1. **Error Boundary** - Catches React render errors
2. **Logger** - Logs all errors with context
3. **Toast Notifications** - User-friendly error messages
4. **HTTP Client** - Handles API errors gracefully

## Accessibility

All components follow WCAG accessibility guidelines:

- ✅ ARIA labels on all interactive elements
- ✅ Focus-visible states for keyboard navigation
- ✅ Proper button types and semantic HTML
- ✅ Error messages linked to form fields
- ✅ Screen reader support

## Development Workflow

### Creating a New Hook
```typescript
import { createLogger } from "@/lib/logger";

export const useMyHook = () => {
  const logger = createLogger("useMyHook");
  // Your logic here
};
```

### Adding Tests
```bash
# Create test file
touch src/features/myfeature/MyComponent.test.tsx

# Run tests
pnpm run test
```

### Making API Calls
```typescript
import { api } from "@/lib/api";

const data = await api.post("/endpoint", { body });
const items = await api.get("/items");
```

## Environment Variables

Variables are validated with Zod at startup:

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)
- `NODE_ENV` - Environment (development, production, test)
- `LOG_LEVEL` - Logging level (optional)

## Architecture Highlights

- **Type-safe**: Full TypeScript, Zod validation
- **Performant**: React Hook Form, memoization, code splitting ready
- **Testable**: Vitest, Testing Library, composable hooks
- **Maintainable**: Feature-based structure, clear patterns
- **Accessible**: WCAG compliant, keyboard navigation
- **Logged**: Structured logging with context

## Known Limitations

- Real-time collaboration (WebSocket) - not yet implemented
- Dark mode - theme provider ready for setup
- i18n - ready for integration
- Analytics - ready for integration

## Production Deployment

```bash
# Build
pnpm run build

# Start
pnpm run start
```

Set `NEXT_PUBLIC_API_URL` environment variable to backend API URL.

## Documentation

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Detailed changes and new features
- **[CLAUDE.md](./CLAUDE.md)** - Project conventions and guidelines
- **[AGENTS.md](./AGENTS.md)** - AI agent guidelines

## Support

For issues or questions, check:
1. Error logs in browser console
2. Network tab for API errors
3. Redux DevTools for state debugging
4. Test files for usage examples

