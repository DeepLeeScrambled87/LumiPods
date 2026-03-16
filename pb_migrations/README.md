# PocketBase Migrations

This folder contains the database schema for LumiPods.

## Setup

1. Start PocketBase: `docker-compose up pocketbase`
2. Open admin UI: http://localhost:8090/_/
3. Create admin account on first run
4. Import collections from `schema.json`

`schema.json` is kept in the current PocketBase collection import format and includes stable collection IDs, relation targets, and owner-scoped API rules.

## Collections

- **users** - Parent/admin accounts (built-in)
- **families** - Family groups with settings
- **learners** - Individual students within families
- **pods** - Learning pod templates
- **artifacts** - Portfolio items (photos, videos, code, etc.)
- **progress** - Daily learner progress aggregates
- **competencies** - Skill level assessments
- **points** - Gamification events

## Schema Updates

When modifying the schema:
1. Make changes in PocketBase admin UI
2. Export settings → Download as JSON
3. Save to `schema.json`
4. Commit to version control
