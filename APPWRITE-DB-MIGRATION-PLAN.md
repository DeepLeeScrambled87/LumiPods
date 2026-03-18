# Appwrite DB Migration Plan

This plan assumes LumiPods will move from PocketBase to Appwrite early, before public launch.

## Current State

- Frontend hosting can already go to Appwrite Sites.
- App data is still PocketBase-backed through the service layer.
- Current PocketBase collections in active use include:
  - `families`
  - `learners`
  - `artifacts`
  - `progress`
  - `points`
  - `rewards_redemptions`
  - `projects`
  - `project_steps`
  - `reflection_entries`
  - `external_activity_sessions`
  - `achievement_unlocks`
  - `planning_rules`
- Local PocketBase footprint measured on 2026-03-16:
  - total `/pb_data`: about `581.9 MB`
  - uploaded file storage: about `562.4 MB`
  - DB files: about `18.8 MB`

## Key Decision

Do not manually re-upload pod files one by one.

Instead:

1. Back up PocketBase records and file storage.
2. Create the Appwrite schema and storage buckets.
3. Run a scripted migration that:
   - reads PocketBase records
   - copies file bytes from PocketBase storage
   - uploads those bytes to Appwrite Storage
   - recreates the related Appwrite documents with the new file IDs

This still uploads files into Appwrite, but it is automated and preserves the existing library/content set without human re-entry.

## Recommended Migration Strategy

### Phase 1: Freeze and Back Up

Before touching production wiring:

1. Freeze schema changes for a short migration window.
2. Take a full PocketBase backup:
   - copy `/pb_data/data.db`
   - copy `/pb_data/auxiliary.db`
   - copy `/pb_data/storage`
3. Export a JSON snapshot of active collections for validation.

### Phase 2: Set Up Appwrite Structure

Create these resources in Appwrite:

1. `Databases`
   - one LumiPods database
2. `Collections`
   - mirror the active PocketBase collections
3. `Storage`
   - at least one bucket for artifacts and pod assets
4. `Auth`
   - map parent auth to Appwrite Account

Recommended approach:

- preserve old PocketBase IDs in a field like `legacyPocketBaseId`
- use Appwrite document security instead of PocketBase API rules
- keep file metadata on the related artifact documents, not only in storage

### Phase 3: Scripted Data Migration

Use a one-off local migration script, not manual CLI commands per record.

The script should:

1. Pull PocketBase records in dependency order:
   - families
   - learners
   - artifacts
   - progress
   - points
   - rewards and learning records
2. Build an ID map:
   - old PocketBase ID -> new Appwrite document ID
3. Copy files:
   - locate PocketBase file references from artifact records
   - read the underlying bytes from PocketBase storage
   - upload to Appwrite Storage
   - attach new Appwrite file IDs and URLs to migrated artifact docs
4. Migrate relationship fields using the ID map
5. Validate counts after each collection

### Phase 4: Dual-Read Validation

Before cutover:

1. Compare record counts between PocketBase and Appwrite
2. Spot-check:
   - parent login
   - learner records
   - pod library assets
   - schedule resources
   - rewards totals
   - achievement unlocks
3. Verify uploaded files open correctly from Appwrite

### Phase 5: App Cutover

After validation:

1. Introduce an Appwrite-backed service layer
2. Switch reads to Appwrite
3. Keep PocketBase backup read-only for rollback
4. Remove PocketBase dependency after confidence period

## Best Implementation Path

### Use Appwrite CLI for:

- project initialization
- pulling/pushing collections and buckets
- function setup if needed

### Use a local Node migration script for:

- transforming records
- copying files
- setting permissions
- preserving relationships
- validation reports

Pure CLI-only migration will be too awkward for cross-record mapping and file relocation.

## What Can Wait

These do not need to block the DB migration:

- session path wording bugs
- French/AI-skills tab relevance tuning
- popup presentation/detail polish

## What Should Be Cleaned First

These are worth checking before migration so bad data is not carried forward:

- incorrect achievement unlock records
- duplicate notification records
- point balance inconsistencies
- any learner-scoping issues for rewards or badges

These are data-integrity concerns, not just UI concerns.

## Why Now Is a Good Time

Moving now is cheaper than moving later because:

- the data model is still evolving
- live user volume is still low
- file storage size is still manageable
- frontend/backend seams are already reasonably centralized

## Proposed Execution Order

1. Finalize the Appwrite collection and bucket design.
2. Build the migration script.
3. Run the migration against a fresh Appwrite project.
4. Validate data and files.
5. Add an Appwrite service adapter beside the PocketBase layer.
6. Switch the app to Appwrite.
7. Remove PocketBase only after a short rollback window.

## Suggested First Concrete Next Step

Map `pb_migrations/schema.json` to an Appwrite collection design and define:

- collection names
- attribute types
- relationships
- permissions model
- storage bucket structure
- artifact/file metadata fields

Once that mapping is done, the migration script can be built with much less guesswork.
