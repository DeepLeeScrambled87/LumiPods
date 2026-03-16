# Pod Authoring Framework

Lumipods now uses a hybrid content model:

- `canonical lessons` are the stable truth layer for each week and skill band
- `project templates` are the reusable hands-on layer
- `personalization` changes framing, examples, and project flavor without changing core concepts

## Core Rules

1. Foundations are authored once per week and per skill band.
2. Personalization is applied on top of that authored layer using learner interests, confidence, and accommodations.
3. Lumi tutor should stay inside canonical material for the active pod/week and use interests only for analogies, hints, and project framing.
4. New pods should ship with the same minimum structure before they are considered live-ready.

## Minimum Pod Checklist

- `segments` for the whole pod
- `ageBandGuidance` for all 4 levels
- `tasksBySkillLevel` for each week
- `canonicalLessonsBySkillLevel` for each week
- `flashcards`
- `quizQuestions`
- `interactiveTasks`
- `projectTemplates`
- `weeklyProject`
- `references`
- `supportingAssets`

## Canonical Lesson Schema

Each canonical mini-lesson should include:

- `title`
- `learningObjective`
- `explanationSections`
- `concreteExample`
- `quickChecks`
- `keyTakeaways`
- `estimatedMinutes`
- optional `day`, `tags`, and `relatedActivities`

## Project Template Schema

Each reusable project template should include:

- `title`
- `style`
- `description`
- `learningGoals`
- `materials`
- `steps`
- `interestHookTemplate`
- `estimatedTimeMinutes`
- `skillLevels`

Use `{interest}` and `{secondaryInterest}` placeholders where a project should be personalized.

## Personalization Layer

Personalization currently uses:

- learner `preferences.interests`
- learner `skillLevel`
- active pod/week context
- canonical lesson snippets for tutor prompting

This means:

- schedules can surface clearer session guidance from canonical lessons
- pod libraries can preview interest-shaped project pathways
- Lumi can explain the same science idea differently for different learners without drifting off curriculum

## Current Reference Implementation

The first full exemplar is:

- `Atomic Foundations: Hidden Building Blocks`

It now includes:

- week-1 canonical mini-lessons across all 4 levels
- reusable week-1 project templates
- daily quiz blocks with per-day and weekly tracking
- interest-aware tutor context
