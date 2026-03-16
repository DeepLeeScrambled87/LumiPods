# LumiPods AI Coding Assistant Guide

## Project Overview
LumiPods is a homeschooling management platform built with React 19 + TypeScript + Vite, using PocketBase as the backend. It supports multi-learner scheduling, portfolio management, gamification, and AI-powered tutoring.

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: PocketBase (SQLite-based BaaS)
- **State Management**: React Context API (`AuthContext`, `FamilyContext`)
- **UI Libraries**: Framer Motion, Radix UI (Tooltip), Sonner (toast notifications)
- **Build**: Vite with code splitting via `lazy()` imports

### Key Directories
```
src/
├── app/              # Root app component and layouts (AppLayout, LearnerLayout)
├── features/         # Feature modules (auth, calendar, dashboard, progress, etc.)
├── components/       # Shared UI components and domain-specific components
├── services/         # Backend integration (database.ts, pocketbase/, notificationService.ts)
├── hooks/            # Custom React hooks (useDatabase, usePWA, useTimer, useLocalStorage)
├── types/            # TypeScript type definitions (centralized in index.ts)
├── lib/              # Utilities (pocketbase.ts client configuration)
└── data/             # Mock/seed data
```

### Data Flow
1. **PocketBase Client**: Configured in [src/lib/pocketbase.ts](src/lib/pocketbase.ts) with collection constants (`COLLECTIONS`)
2. **Database Service**: [src/services/database.ts](src/services/database.ts) provides typed CRUD operations for all collections
3. **Context Providers**: `AuthProvider` and `FamilyProvider` wrap the app, managing global state
4. **Feature Modules**: Self-contained in `src/features/` with their own components, contexts, and logic

## Development Workflows

### Local Development
```bash
npm run dev              # Start Vite dev server on port 3002 with host exposure
npm run build            # TypeScript check + production build
npm run lint             # ESLint with flat config (eslint.config.js)
npm run preview          # Preview production build
```

### Docker Workflows
```bash
npm run docker:up        # Start PocketBase + production frontend
npm run docker:dev       # Start with hot reload (port 3000)
npm run docker:down      # Stop all containers
```
- PocketBase runs on **port 8090** (admin UI at `http://localhost:8090/_/`)
- Production frontend on **port 8888**, dev on **port 3000**
- Schema managed in [pb_migrations/schema.json](pb_migrations/schema.json) - import via PocketBase admin UI

### PocketBase Setup
1. Start PocketBase: `docker-compose up pocketbase`
2. Create admin account at http://localhost:8090/_/
3. Import [pb_migrations/schema.json](pb_migrations/schema.json) via Settings → Import collections
4. Collections: `families`, `learners`, `schedules`, `blocks`, `vr_sessions`, `french_lessons`, `artifacts`, `progress`, `competencies`, `points`

## Coding Conventions

### Component Patterns
- **Feature Modules**: Export components via `index.ts` barrel files (e.g., `src/features/auth/index.ts`)
- **Lazy Loading**: All page components lazy-loaded in [src/app/App.tsx](src/app/App.tsx) for code splitting
- **UI Components**: Centralized exports in [src/components/ui/index.ts](src/components/ui/index.ts)
- **Layouts**: Two primary layouts - `AppLayout` (parent view) and `LearnerLayout` (child view with simplified nav)

### TypeScript Patterns
- **Centralized Types**: All domain types exported from [src/types/index.ts](src/types/index.ts)
- **PocketBase Types**: Extend `RecordModel` from `pocketbase` package (see [src/services/database.ts](src/services/database.ts))
- **Strict Typing**: Use TypeScript 5.8 with `tsconfig.app.json` for app code, `tsconfig.node.json` for build scripts

### State Management
- **Context Pattern**: Use `createContext` + custom hooks (e.g., `useAuth`, `useFamily`)
- **LocalStorage Sync**: Auth state persists in localStorage as `lumipods-family`
- **Database Hook**: `useDatabase()` provides offline-first CRUD with sync queue

### Styling
- **Tailwind CSS v4**: Use utility classes with custom theme in [tailwind.config.js](tailwind.config.js)
- **Design System**: Custom color palette (`primary`, `secondary`, `accent`) with extended values
- **Motion**: Use `framer-motion` for animations, wrapped in `LazyMotion` with `domAnimation` for bundle size

## Critical Patterns

### Navigation System
- Page IDs typed as `PageId` union (see [src/app/layouts/AppLayout.tsx](src/app/layouts/AppLayout.tsx))
- Primary nav items always visible in top bar: Dashboard, Calendar, Pods, Portfolio
- Full nav grouped by sections (Learning, Progress & Portfolio, Resources, Rewards & Settings)

### Authentication Flow
- `AuthProvider` wraps app, provides `isAuthenticated`, `family`, `login()`, `logout()`
- Family data includes learners, currentPodId, currentWeek, settings
- Points/streak updates via `updateLearnerPoints()`, `updateLearnerStreak()`

### PocketBase Integration
- Client auto-cancellation disabled for better UX: `pb.autoCancellation(false)`
- Auth helpers: `isAuthenticated()`, `currentUser()`, `logout()`
- Collection names via `COLLECTIONS` constant (never hardcode strings)

### Feature Development
When adding new features:
1. Create directory in `src/features/<feature-name>/`
2. Include `index.ts` for barrel exports
3. Co-locate components, hooks, and types within feature folder
4. Update [src/app/App.tsx](src/app/App.tsx) for routing and lazy loading
5. Add to `PageId` union and nav items in [src/app/layouts/AppLayout.tsx](src/app/layouts/AppLayout.tsx)

### Database Schema Updates
1. Modify schema in PocketBase admin UI
2. Export settings → Download as JSON
3. Save to [pb_migrations/schema.json](pb_migrations/schema.json)
4. Update TypeScript types in [src/services/database.ts](src/services/database.ts)

## Testing & Debugging
- No test framework currently configured
- Use browser DevTools + React DevTools
- PocketBase has built-in API explorer at `http://localhost:8090/_/#/collections`
- Check [src/services/notificationService.ts](src/services/notificationService.ts) for reminder system with `startReminderChecker()`

## Common Tasks

### Add a New Page
1. Create component in `src/features/<feature>/`
2. Export from `src/features/<feature>/index.ts`
3. Lazy import in [src/app/App.tsx](src/app/App.tsx)
4. Add route case in `renderPage()` switch statement
5. Add to `PageId` type and nav in [src/app/layouts/AppLayout.tsx](src/app/layouts/AppLayout.tsx)

### Add a New Collection
1. Define in PocketBase admin UI
2. Export schema to [pb_migrations/schema.json](pb_migrations/schema.json)
3. Add constant to `COLLECTIONS` in [src/lib/pocketbase.ts](src/lib/pocketbase.ts)
4. Create TypeScript interface in [src/services/database.ts](src/services/database.ts)
5. Implement CRUD functions in database service

### Add Custom Hook
- Place in `src/hooks/` directory
- Follow naming convention: `use<Feature>.ts`
- Examples: `useDatabase`, `usePWA`, `useTimer`, `useLocalStorage`
