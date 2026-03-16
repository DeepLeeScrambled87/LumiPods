# Project Context - Always Active

## On Session Start
1. **Read `instructions.md`** at project root before starting any work
2. This file contains critical patterns, conventions, and architecture decisions

## On Session End / Major Changes
When completing significant work, update `instructions.md` with:
- New features/pages added
- New patterns introduced
- Changed conventions
- Update the "Last Updated" date

## Quick Reference
- Build command: `npm run build` (always run to verify)
- Button variants: `primary | secondary | ghost | danger`
- Context: `useFamily()` → `family?.learners`
- Lazy load new pages in `src/app/App.tsx`
- Unused imports = build failure

## File Reference
#[[file:instructions.md]]
