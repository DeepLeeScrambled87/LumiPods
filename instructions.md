# LumiPods - AI Agent Instructions

> **Last Updated:** January 1, 2026

## Project Overview
LumiPods is a homeschool learning management platform built with React 19 + TypeScript + Vite + Tailwind CSS 4. Backend uses PocketBase for data persistence with localStorage fallback.

## Commands
```bash
npm run build    # TypeScript check + Vite build (ALWAYS run to verify changes)
npm run lint     # ESLint check
npm run dev      # Dev server (run manually, not in agent)
```

## Architecture

### Feature-Based Structure
```
src/features/{feature}/
  ├── {Feature}Page.tsx    # Main page component
  ├── index.ts             # Barrel exports
  └── {SubComponent}.tsx   # Feature-specific components
```
Key features: `auth`, `calendar`, `dashboard`, `family`, `french`, `gamification`, `maths`, `month-detailed`, `portfolio`, `progress`, `resources`, `students`, `tutor`

### Core Patterns

**Context Pattern** - `FamilyContext` is the primary state manager:
```tsx
const { family } = useFamily();
const learners = family?.learners || [];  // Always access via family object
```

**Theme Context** - Light/Dark mode toggle:
```tsx
const { theme, setTheme } = useTheme();  // 'light' | 'dark' | 'system'
```

**Service Layer** - Business logic in `src/services/`:
- `curriculumService.ts` - **Central bridge** connecting curriculum ↔ schedules ↔ progress ↔ portfolio
- `scheduleService.ts` - Daily schedules, blocks, metrics (uses curriculumService for pod-based schedules)
- `portfolioService.ts` - Artifacts, competencies
- `dataService.ts` - PocketBase sync with localStorage fallback

**Type Definitions** - `src/types/`:
- `schedule.ts` - `DailySchedule`, `ScheduleBlock`, `BlockType`, `BlockStatus`, `FrenchVocabItem`, `AISkillsData`
- `curriculum.ts` - `PodCurriculum`, `WeekCurriculum`, rubrics, evidence, tasks
- `learner.ts`, `family.ts` - Core domain types
- `pod.ts` - Learning pod types with `PodTheme` union

**Curriculum Data** - `src/data/curriculum/`:
- `flightCurriculum.ts` - Month 1 Flight & Systems (4 weeks)
- Each week has: Overview, Tasks (by skill level), Evidence, Rubric, Materials, Daily Flow

**Pods Data** - `src/data/pods/`:
- `index.ts` - Exports ALL_PODS (CORE_PODS + LANGUAGE_PODS + YEARLY_CURRICULUM_PODS)
- `yearlyPods.ts` - 12 month year-round curriculum pods with complexity progression
- POD_CATEGORIES: STEM, Languages, Year-Round Curriculum

### UI Components
Located in `src/components/ui/`. Button variants are:
```tsx
variant: 'primary' | 'secondary' | 'ghost' | 'danger'  // NOT 'outline'
```

### Routing
App uses state-based routing in `src/app/App.tsx`:
```tsx
const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
// Pages lazy-loaded with React.lazy()
```

## Critical Rules

1. **Unused imports/variables cause build failures** - Remove or prefix with `_`
2. **Always run `npm run build`** after changes to catch TypeScript errors
3. **Lazy loading** - New pages must use `lazy(() => import(...))` pattern
4. **Storage keys** - Use `STORAGE_KEYS` from `src/lib/storage.ts`
5. **IDs** - Generate with `generateId()` from `src/lib/id.ts`

## Data Flow
```
PodCurriculum (data/curriculum/)
       │
       ▼
curriculumService ──────────────────────────────┐
       │                                        │
       ├─► scheduleService (daily blocks)       │
       │         │                              │
       │         ▼                              │
       │   CalendarPage                         │
       │                                        │
       ├─► Progress tracking (LearnerWeekProgress)
       │                                        │
       └─► Portfolio (evidence → artifacts) ◄───┘

User Action → Context/Service → localStorage → PocketBase (async)
```

## Key Files
- `src/app/App.tsx` - Entry, routing, providers
- `src/app/layouts/AppLayout.tsx` - Navigation with dropdown menu
- `src/features/family/FamilyContext.tsx` - Global state
- `src/features/month-detailed/MonthDetailedPage.tsx` - Detailed pod curriculum view
- `src/features/students/StudentProfilePage.tsx` - Student profiles with 5 tabs (Overview, Portfolio, Projects, Achievements, Progress)
- `src/features/calendar/BlockDetailsModal.tsx` - Enhanced block modal with 5 tabs (Overview, Français, AI Skills, Resources, Portfolio) - clean light-mode styling
- `src/components/pods/PodsPage.tsx` - Pods browser with category filters (All, STEM, Languages, Year-Round)
- `src/features/maths/MathsGamesPage.tsx` - Interactive math games (Times Tables, Roman Numerals, Percent/Decimal conversions, Fractions)
- `src/features/french/FrenchReadingPage.tsx` - French syllable-based phonics learning (Foundation: Days/Months/Seasons/Numbers, Phonics: Pure Sounds/CV Syllables/Syllable Stack/Sound Families/Whole Words/Homophones, Grammar: Nouns/Verbs/Adjectives/Pronouns/Conjunctions)
- `src/data/curriculum/` - Pod curriculum data (weeks, tasks, rubrics)
- `src/data/crossSubjectBlocks.ts` - Pod curriculum with French vocab
- `src/data/partnerPlatforms.ts` - External learning tools
