# Webplatform Frontend

This is the Next.js 15 frontend for the Webplatform project, featuring a complete visual page builder, authentication, and project management.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4 + CSS Modules
- State Management: Zustand
- Data Fetching: TanStack React Query
- Drag & Drop: @dnd-kit

## Getting Started

1. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
The project follows a feature-based architecture (`src/features/*`) to maintain strict separation of concerns.

- `src/features/auth`: Login and registration
- `src/features/projects`: Dashboard and project management
- `src/features/pages`: Page tree and routing
- `src/features/blocks`: Core visual editor, drag & drop canvas, block renderer, and property editor
- `src/store`: Global state (Zustand)
- `src/types`: Strictly synced types with the Fastify backend

## Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
