# LumiPods Implementation Backlog

Date: 2026-03-07

## Goal

Take LumiPods from promising prototype to QA-ready product in the highest-value order:

1. Fix data integrity and auth foundations.
2. Unify backend schema and service contracts.
3. Replace mock UI with live or clearly staged data.
4. Add real connector pathways for external learning activity.
5. Expand portfolio-first gamification and neurodivergent support.
6. Harden for QA.

## QA Definition Of Ready

- Family creation and reload preserve the same family identity.
- Parent and learner views cannot escalate privileges client-side.
- Learner creation, update, and deletion persist cleanly.
- Portfolio, rewards, progress, and reports use one agreed backend contract.
- UI clearly distinguishes live data from placeholders.
- External activity can be captured manually before automated sync ships.
- Build passes.
- Lint passes.
- Critical flows have automated coverage.

## Phase 1: Foundation And Identity

Priority: Critical

- [x] Fix parent login to use the created family record instead of a synthetic ID.
- [x] Make family persistence create-aware instead of update-only.
- [x] Keep auth family identity aligned with family state.
- [x] Normalize learner IDs after remote create so local state is not left with stale temporary IDs.
- [x] Replace local-only auth with real PocketBase parent auth.
- [x] Add learner PIN or equivalent learner-safe entry flow backed by stored learner data.
- [x] Remove unused client-side parent escalation path completely.
- [ ] Decide whether family creation is local-first, account-backed, or both, and reflect that in copy and UI.

Current tranche notes:

- Completed in this pass:
  - parent login now uses the returned family ID
  - family save can create or update appropriately
  - auth is cleared if family state disappears
  - learner create path preserves synced IDs locally
  - client-side parent escalation helper was removed
  - parent sign-in and sign-up now go through PocketBase auth and hydrate the managed family
  - learner login now supports stored learner PINs
  - settings now manage learner PINs

QA gate:

- Create a family from login.
- Refresh the app.
- Confirm parent session still maps to the same family.
- Add a learner.
- Refresh again.
- Confirm learner still exists and routes render normally.

## Phase 2: Backend Contract Unification

Priority: Critical

- [x] Pick the real `progress` model: daily aggregate or per-block state.
- [x] Align PocketBase schema, TypeScript types, and the active services to that one model.
- [x] Consolidate duplicate PocketBase access layers into one canonical active service layer.
- [x] Fix artifact contract mismatches: `learner` vs `learnerId`, `externalUrl` vs `url`, required `family`, file handling.
- [ ] Add or remove collections intentionally:
  - `achievement_unlocks`
  - `integration_accounts`
  - `integration_sync_jobs`
  - `external_activity_events`
  - `projects`
  - `project_steps`
  - `time_support_profiles`
- [ ] Decide whether rewards are template-driven, data-driven, or both, and wire redemptions accordingly.

Current tranche notes:

- Completed in this pass:
  - active progress persistence now upserts daily records by `family + learner + date`
  - active portfolio persistence now writes `family`, `learner`, and `externalUrl` correctly
  - portfolio page no longer seeds mock artifacts or competencies when there is no real data
  - reward redemptions now persist to `rewards_redemptions`
  - `pb_migrations/schema.json` now uses the current PocketBase import format with explicit collection IDs and relation targets
  - PocketBase collection rules now allow authenticated parents to create and access only their own family data
  - live PocketBase smoke test passed for parent auth plus family, learner, progress, artifact, and reward-redemption records
  - a second authenticated user could not read or write another family’s records
  - removed unused duplicate database, progress, and stale PocketBase artifact/progress service layers
- Still open:
  - verify file upload flows against a running PocketBase instance
  - decide the long-term backend home for achievements instead of the missing `achievements` collection

QA gate:

- Run against a live PocketBase instance.
- Create, update, and fetch family, learner, artifact, progress, and reward data without schema errors.
- Confirm owner-scoped rules prevent cross-family reads and writes.

## Phase 3: Replace Mock UI With Live Data

Priority: High

- [x] Replace dashboard hardcoded schedule and materials with persisted schedule/material data.
- [x] Replace report placeholder stats with real aggregation.
- [x] Replace student profile mock portfolio with live sources and explicit unsupported states for projects and achievements.
- [x] Replace calendar-generated sample events with real stored schedules and tracked sessions.
- [x] Make placeholder or demo states explicit anywhere real data is not ready yet.

Current tranche notes:

- Completed in this pass:
  - dashboard now creates and loads persisted daily schedules instead of showing hardcoded day data
  - dashboard materials, current block, delay, resume, and complete flows now operate on stored schedules
  - completing or skipping a schedule block now syncs a real daily progress record
  - calendar month view now reads stored schedules rather than generating demo events
  - reports now aggregate real `progress` data by the selected period
  - student profile now loads real artifacts, competencies, progress stats, and current focus
  - unsupported project and achievement surfaces now show explicit staged empty states instead of fake content
- Still open:
  - add a real backend model for achievements and projects
  - decide whether learner-level points should be cached on the learner record or derived entirely from progress
  - extend live schedule creation beyond day-by-day generation if monthly planning needs persistent bulk creation

QA gate:

- Empty-state UX is clear.
- Seeded or real family data appears consistently across dashboard, portfolio, reports, and calendar.

## Phase 4: External Learning Connectors

Priority: High

- [ ] Ship manual import first:
  - screenshot/link/certificate/notebook import
  - normalize imported work into artifact and progress records
- [ ] Add connector data model:
  - linked account
  - sync status
  - imported activity
  - source confidence
- [ ] Build adapter layer for first targets:
  - Scratch
  - Khan Academy
  - Duolingo
  - GitHub
  - Colab / notebook links
  - Kaggle
- [ ] Add freshness indicators and last-sync surfaces in UI.

QA gate:

- A learner can bring outside work back into LumiPods even before full OAuth sync ships.

## Phase 5: Gamification And Learner Support

Priority: High

- [ ] Persist reward redemptions with approval and fulfillment states.
- [ ] Convert achievements from static demo logic to evidence-backed unlocks.
- [ ] Add quest chains tied to pods and projects.
- [ ] Add strategy badges for compare, test, revise, explain, debug, and reflect.
- [ ] Add comeback streaks and grace-based momentum instead of punitive streak loss.
- [ ] Add visual time support:
  - now / next / later
  - transition countdowns
  - visual time strip
  - finish-line markers
- [ ] Add neurodivergent support profiles:
  - reduced-load mode
  - chunk-size preferences
  - energy-aware reshuffling
  - stuck/reset/help flows
  - recovery plans after disrupted days

QA gate:

- A learner can complete a block, capture evidence, earn progress, and understand what happens next without ambiguity.

## Phase 6: Content And Project Depth

Priority: Medium

- [x] Ship one fully structured exemplar pod with:
  - multi-age task bands
  - flashcards
  - quick checks
  - interactive tasks
  - project briefs
  - references and support assets
  - pacing options and planning questions
- [ ] Make yearly pods executable by adding real weeks and blocks.
- [ ] Bring elective and AI/ML pod libraries into the runtime intentionally.
- [ ] Create project templates with:
  - age bands
  - materials
  - safety notes
  - adult support level
  - rubric
  - artifact expectations
  - extension ideas
- [ ] Add concept-to-build pathways, especially for math, ML, anatomy, chemistry, and systems thinking.

Current tranche notes:

- Completed in this pass:
  - added `Atomic Foundations: Hidden Building Blocks` as the first fully structured live pod
  - encoded digestible science segments covering particle foundations, atomic model history, periodic-table reasoning, and atoms in everyday materials
  - added pacing-aware pod activation so families can choose a 4, 6, 8, or 12 week path
  - exposed study resources in the detailed curriculum view, including flashcards, quiz prompts, interactive tasks, references, and support assets
- Still open:
  - add more exemplar pods using the same structure
  - persist pod-support assets as first-class uploaded artifacts instead of metadata placeholders
  - decide whether segment-level progress should be tracked separately from week-level progress

QA gate:

- Each pod leads to real, portfolio-worthy outputs and clear progression paths.

## Phase 7: QA Hardening

Priority: Critical before release

- [x] Stand up PocketBase locally and verify migrations on a clean instance.
- [ ] Add test coverage for auth, family persistence, learner CRUD, rewards, and portfolio flows.
- [ ] Clean remaining lint errors.
- [ ] Remove or archive legacy app paths not used by `src/main.tsx`.
- [ ] Create a repeatable QA checklist and seed dataset.
- [ ] Smoke test offline mode and sync recovery intentionally.

## Next Working Sequence

1. Replace mock dashboard, reports, calendar, and student profile data with live or explicit empty states.
2. Add reward approval and fulfillment handling plus a real achievement persistence model.
3. Add manual external activity import so outside learning can land as real artifacts and progress.
4. Start Phase 7 QA hardening with automated coverage and the remaining repo-wide lint cleanup.
5. Remove or archive the remaining legacy app paths not used by `src/main.tsx`.
