# Appwrite Schema Map

This maps the current PocketBase-backed LumiPods data model to Appwrite.

## Recommended Appwrite Setup

Create one Appwrite project for LumiPods.

Inside that project, create:

1. One Site for the React frontend
2. One Database for LumiPods app data
3. Storage buckets for files
4. Auth configuration for parent accounts

The Site can be created now. It does not block or change the DB migration.

## Recommended Resource Names

### Database

- `lumipods`

### Storage Buckets

- `learner-artifacts`
  - learner uploads
  - pod teaching assets
  - PDFs
  - videos
  - presentations
  - images
- Optional later:
  - `learner-avatars`
  - `generated-media`

For now, one `learner-artifacts` bucket is enough if you want to move quickly.

## Collection Map

### Core Family and Learners

#### `families`

Mirror from PocketBase `families`.

Fields:
- `legacyPocketBaseId` string
- `name` string
- `ownerUserId` string
- `settings` string or JSON stringified blob
- `currentPodId` string
- `currentWeek` integer
- `timezone` string
- `schoolYearStart` integer

#### `learners`

Mirror from PocketBase `learners`.

Fields:
- `legacyPocketBaseId` string
- `familyId` string
- `name` string
- `age` integer
- `skillLevel` string
- `avatar` string
- `points` integer
- `streakDays` integer
- `preferences` string or JSON stringified blob
- `pin` string

### Scheduling

#### `schedules`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `date`
- `dayOfWeek`
- `isTemplate`
- `blocksJson`

#### `blocks`

Fields:
- `legacyPocketBaseId`
- `scheduleId`
- `learnerId`
- `title`
- `subject`
- `type`
- `startTime`
- `duration`
- `status`
- `delayedUntil`
- `podId`
- `weekNumber`
- `description`
- `materialsJson`
- `resourcesJson`
- `completedAt`
- `focusMinutes`
- `pointsEarned`

### Artifacts and Competencies

#### `artifacts`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `type`
- `title`
- `description`
- `reflection`
- `fileId`
- `fileName`
- `fileMimeType`
- `fileSize`
- `thumbnailUrl`
- `externalUrl`
- `tagsJson`
- `competenciesJson`
- `skillLevel`
- `visibility`
- `isFeatured`
- `podId`
- `blockId`
- `weekNumber`
- `iterationsJson`
- `feedbackJson`
- `rubricScoreJson`
- `publishedAt`

Important:

- PocketBase `file` becomes Appwrite Storage `fileId`
- also preserve the original filename and MIME type for easier rendering/debugging

#### `competencies`

Fields:
- `legacyPocketBaseId`
- `learnerId`
- `domain`
- `level`
- `evidenceIdsJson`
- `assessedBy`
- `notes`

### Progress, Points, Rewards

#### `progress`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `date`
- `podId`
- `weekNumber`
- `blocksCompleted`
- `blocksTotal`
- `focusMinutes`
- `pointsEarned`
- `artifactsCreated`
- `streakMaintained`
- `frenchMinutes`
- `vrMinutes`

#### `points`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `type`
- `points`
- `blockId`
- `artifactId`
- `description`
- `sourceDate`

#### `rewards_redemptions`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `rewardId`
- `rewardTitle`
- `pointsSpent`
- `status`
- `approvedBy`
- `approvedAt`
- `fulfilledAt`
- `notes`

### Projects and Reflections

#### `projects`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `podId`
- `title`
- `summary`
- `goal`
- `status`
- `source`
- `skillLevel`
- `challengeLevel`
- `startDate`
- `targetDate`
- `completedAt`
- `externalPlatformIdsJson`
- `tagsJson`
- `artifactIdsJson`
- `reflectionIdsJson`
- `lastWorkedAt`

#### `project_steps`

Fields:
- `legacyPocketBaseId`
- `projectId`
- `familyId`
- `learnerId`
- `title`
- `description`
- `status`
- `orderIndex`
- `linkedBlockId`
- `linkedPlatformId`
- `dueDate`
- `completedAt`
- `evidenceArtifactIdsJson`
- `notes`

#### `reflection_entries`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `projectId`
- `externalSessionId`
- `blockId`
- `blockTitle`
- `date`
- `prompt`
- `whatLearned`
- `challenge`
- `nextStep`
- `confidence`
- `notes`
- `quizAnswersJson`
- `evidenceArtifactIdsJson`
- `tagsJson`

### External Sessions and Achievements

#### `external_activity_sessions`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `projectId`
- `platformId`
- `platformName`
- `title`
- `description`
- `launchUrl`
- `scheduledDate`
- `scheduledStartTime`
- `durationMinutes`
- `status`
- `syncMode`
- `importedAccountLabel`
- `notes`
- `reflectionId`
- `evidenceArtifactIdsJson`
- `tagsJson`
- `completedAt`
- `blockId`
- `lastSyncedAt`

#### `achievement_unlocks`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `achievementId`
- `unlockedAt`
- `sourceType`
- `sourceId`
- `pointsAwarded`

#### `planning_rules`

Fields:
- `legacyPocketBaseId`
- `familyId`
- `learnerId`
- `name`
- `status`
- `primaryPodId`
- `supportPodIdsJson`
- `preferredPlatformIdsJson`
- `weeklyProjectSessions`
- `weeklyExternalSessions`
- `includeMovement`
- `includeFrench`
- `includeWriting`
- `challengeLevel`
- `periodStart`
- `periodEnd`

## Appwrite Permission Model

Recommended baseline:

- Parent account owns family-scoped records
- Documents should be readable/writable only by the authenticated parent account
- Learner-side app mode should continue to operate through the parent-authenticated family session or through future learner-safe access patterns

For migration simplicity:

- start with parent-owner permissions at document level
- preserve `familyId` and `learnerId` as explicit fields for filtering

## Storage Notes

Current PocketBase file storage is about `562.4 MB`.

Important current facts:

- total stored files: `66`
- files above `30 MB`: `10`
- largest file: `44.0 MB`

If you are using Appwrite Cloud, assume the per-file limit is relevant when planning video uploads.

## Migration Script Requirements

The migration script should:

1. read PocketBase documents
2. copy file bytes for artifact records
3. upload files to the Appwrite bucket
4. create Appwrite documents
5. replace relation fields using new Appwrite IDs
6. preserve old PocketBase IDs in `legacyPocketBaseId`

## Recommended Build Order

1. Create the Appwrite project
2. Create the Site
3. Create the `lumipods` database
4. Create the `learner-artifacts` bucket
5. Create the collections above
6. Add env vars for the Site
7. Only then build the migration script against that target
