#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Missing required env var: $name" >&2
    exit 1
  fi
}

require_env APPWRITE_ENDPOINT
require_env APPWRITE_PROJECT_ID
require_env APPWRITE_API_KEY

APPWRITE_DATABASE_ID="${APPWRITE_DATABASE_ID:-lumipods}"
APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT%/}"

api_get() {
  local path="$1"
  curl -sS \
    -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    "$APPWRITE_ENDPOINT$path"
}

api_post() {
  local path="$1"
  local payload="$2"
  curl -sS \
    -X POST \
    -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$APPWRITE_ENDPOINT$path"
}

attribute_status() {
  local collection_id="$1" key="$2"
  api_get "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes" \
    | jq -r --arg key "$key" '.attributes[]? | select(.key == $key) | .status' \
    | head -n1
}

index_exists() {
  local collection_id="$1" key="$2"
  api_get "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/indexes" \
    | jq -e --arg key "$key" '.indexes[]? | select(.key == $key)' >/dev/null 2>&1
}

wait_for_attribute_available() {
  local collection_id="$1" key="$2"
  local attempts=0
  while [ "$attempts" -lt 300 ]; do
    local status
    status="$(attribute_status "$collection_id" "$key" || true)"
    if [ "$status" = "available" ]; then
      return 0
    fi
    if [ "$status" = "failed" ]; then
      echo "Attribute failed: ${collection_id}.${key}" >&2
      return 1
    fi
    sleep 2
    attempts=$((attempts + 1))
  done
  echo "Timed out waiting for attribute: ${collection_id}.${key}" >&2
  return 1
}

ensure_attribute() {
  local collection_id="$1" key="$2" path="$3" payload="$4"
  local status
  status="$(attribute_status "$collection_id" "$key" || true)"

  if [ "$status" = "available" ]; then
    echo "Attribute exists: ${collection_id}.${key}"
    return 0
  fi

  if [ "$status" = "processing" ]; then
    echo "Waiting for attribute: ${collection_id}.${key}"
    wait_for_attribute_available "$collection_id" "$key"
    return 0
  fi

  echo "Creating attribute: ${collection_id}.${key}"
  local response
  response="$(api_post "$path" "$payload")"
  local response_type
  response_type="$(echo "$response" | jq -r '.type // empty')"
  local response_key
  response_key="$(echo "$response" | jq -r '.key // empty')"
  local response_code
  response_code="$(echo "$response" | jq -r '.code // empty')"

  if [ "$response_key" != "$key" ] && [ "$response_code" != "409" ]; then
    echo "$response" >&2
    return 1
  fi

  wait_for_attribute_available "$collection_id" "$key"
}

create_string() {
  local collection_id="$1" key="$2" size="$3" required="$4"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson size "$size" --argjson required "$required" \
    '{key:$key,size:$size,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/string" \
    "$payload"
}

create_text() {
  local collection_id="$1" key="$2" required="$3"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" \
    '{key:$key,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/text" \
    "$payload"
}

create_integer() {
  local collection_id="$1" key="$2" required="$3"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" \
    '{key:$key,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/integer" \
    "$payload"
}

create_boolean() {
  local collection_id="$1" key="$2" required="$3"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" \
    '{key:$key,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/boolean" \
    "$payload"
}

create_datetime() {
  local collection_id="$1" key="$2" required="$3"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" \
    '{key:$key,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/datetime" \
    "$payload"
}

create_enum() {
  local collection_id="$1" key="$2" required="$3"
  shift 3
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" --argjson elements "$(printf '%s\n' "$@" | jq -R . | jq -s .)" \
    '{key:$key,required:$required,elements:$elements}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/enum" \
    "$payload"
}

create_url() {
  local collection_id="$1" key="$2" required="$3"
  local payload
  payload="$(jq -nc --arg key "$key" --argjson required "$required" \
    '{key:$key,required:$required}')"
  ensure_attribute "$collection_id" "$key" \
    "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/attributes/url" \
    "$payload"
}

create_index() {
  local collection_id="$1" key="$2" type="$3"
  shift 3
  if index_exists "$collection_id" "$key"; then
    echo "Index exists: ${collection_id}.${key}"
    return
  fi
  local payload
  payload="$(jq -nc --arg key "$key" --arg type "$type" --argjson attributes "$(printf '%s\n' "$@" | jq -R . | jq -s .)" \
    '{key:$key,type:$type,attributes:$attributes}')"
  echo "Creating index: ${collection_id}.${key}"
  local response
  response="$(api_post "/databases/$APPWRITE_DATABASE_ID/collections/$collection_id/indexes" "$payload")"
  local response_key
  response_key="$(echo "$response" | jq -r '.key // empty')"
  local response_code
  response_code="$(echo "$response" | jq -r '.code // empty')"
  if [ "$response_key" != "$key" ] && [ "$response_code" != "409" ]; then
    echo "$response" >&2
    return 1
  fi
}

apply_families() {
  local c="families"
  create_string  "$c" "legacyPocketBaseId" 64 false
  create_string  "$c" "name" 255 true
  create_string  "$c" "ownerUserId" 64 true
  create_text    "$c" "settingsJson" false
  create_string  "$c" "currentPodId" 255 false
  create_integer "$c" "currentWeek" false
  create_string  "$c" "timezone" 128 false
  create_integer "$c" "schoolYearStart" false
  create_index   "$c" "families_owner_idx" key "ownerUserId"
}

apply_learners() {
  local c="learners"
  create_string  "$c" "legacyPocketBaseId" 64 false
  create_string  "$c" "familyId" 64 true
  create_string  "$c" "name" 255 true
  create_integer "$c" "age" true
  create_enum    "$c" "skillLevel" true foundation intermediate advanced pro
  create_string  "$c" "avatar" 255 false
  create_integer "$c" "points" false
  create_integer "$c" "streakDays" false
  create_text    "$c" "preferencesJson" false
  create_string  "$c" "pin" 64 false
  create_index   "$c" "learners_family_idx" key "familyId"
}

apply_schedules() {
  local c="schedules"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 false
  create_datetime "$c" "date" true
  create_integer  "$c" "dayOfWeek" false
  create_boolean  "$c" "isTemplate" false
  create_text     "$c" "blocksJson" false
  create_index    "$c" "schedules_family_date_idx" key "familyId" "date"
  create_index    "$c" "schedules_learner_date_idx" key "learnerId" "date"
}

apply_blocks() {
  local c="blocks"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "scheduleId" 64 true
  create_string   "$c" "learnerId" 64 false
  create_string   "$c" "title" 255 true
  create_string   "$c" "subject" 64 false
  create_string   "$c" "type" 64 false
  create_string   "$c" "startTime" 32 true
  create_integer  "$c" "duration" true
  create_string   "$c" "status" 64 false
  create_string   "$c" "delayedUntil" 64 false
  create_string   "$c" "podId" 255 false
  create_integer  "$c" "weekNumber" false
  create_text     "$c" "description" false
  create_text     "$c" "materialsJson" false
  create_text     "$c" "resourcesJson" false
  create_datetime "$c" "completedAt" false
  create_integer  "$c" "focusMinutes" false
  create_integer  "$c" "pointsEarned" false
  create_index    "$c" "blocks_schedule_idx" key "scheduleId"
  create_index    "$c" "blocks_learner_idx" key "learnerId"
  create_index    "$c" "blocks_pod_week_idx" key "podId" "weekNumber"
}

apply_artifacts() {
  local c="artifacts"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "type" 64 true
  create_string   "$c" "title" 255 true
  create_text     "$c" "description" false
  create_text     "$c" "reflection" false
  create_string   "$c" "fileId" 64 false
  create_string   "$c" "fileName" 255 false
  create_string   "$c" "fileMimeType" 128 false
  create_integer  "$c" "fileSize" false
  create_url      "$c" "thumbnailUrl" false
  create_url      "$c" "externalUrl" false
  create_text     "$c" "tagsJson" false
  create_text     "$c" "competenciesJson" false
  create_enum     "$c" "skillLevel" false foundation intermediate advanced pro
  create_enum     "$c" "visibility" false private family community public
  create_boolean  "$c" "isFeatured" false
  create_string   "$c" "podId" 255 false
  create_string   "$c" "blockId" 255 false
  create_integer  "$c" "weekNumber" false
  create_text     "$c" "iterationsJson" false
  create_text     "$c" "feedbackJson" false
  create_text     "$c" "rubricScoreJson" false
  create_datetime "$c" "publishedAt" false
  create_index    "$c" "artifacts_family_learner_idx" key "familyId" "learnerId"
  create_index    "$c" "artifacts_pod_week_idx" key "podId" "weekNumber"
}

apply_progress() {
  local c="progress"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_datetime "$c" "date" true
  create_string   "$c" "podId" 255 false
  create_integer  "$c" "weekNumber" false
  create_integer  "$c" "blocksCompleted" false
  create_integer  "$c" "blocksTotal" false
  create_integer  "$c" "focusMinutes" false
  create_integer  "$c" "pointsEarned" false
  create_integer  "$c" "artifactsCreated" false
  create_boolean  "$c" "streakMaintained" false
  create_integer  "$c" "frenchMinutes" false
  create_integer  "$c" "vrMinutes" false
  create_index    "$c" "progress_learner_date_idx" key "learnerId" "date"
}

apply_competencies() {
  local c="competencies"
  create_string  "$c" "legacyPocketBaseId" 64 false
  create_string  "$c" "learnerId" 64 true
  create_string  "$c" "domain" 128 true
  create_string  "$c" "level" 64 true
  create_text    "$c" "evidenceIdsJson" false
  create_string  "$c" "assessedBy" 64 false
  create_text    "$c" "notes" false
  create_index   "$c" "competencies_learner_idx" key "learnerId"
}

apply_points() {
  local c="points"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "type" 128 true
  create_integer  "$c" "points" true
  create_string   "$c" "blockId" 255 false
  create_string   "$c" "artifactId" 64 false
  create_text     "$c" "description" false
  create_datetime "$c" "sourceDate" false
  create_index    "$c" "points_learner_idx" key "learnerId"
  create_index    "$c" "points_learner_date_idx" key "learnerId" "sourceDate"
}

apply_rewards_redemptions() {
  local c="rewards_redemptions"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "rewardId" 255 true
  create_string   "$c" "rewardTitle" 255 false
  create_integer  "$c" "pointsSpent" true
  create_string   "$c" "status" 64 false
  create_string   "$c" "approvedBy" 64 false
  create_datetime "$c" "approvedAt" false
  create_datetime "$c" "fulfilledAt" false
  create_text     "$c" "notes" false
  create_index    "$c" "rewards_learner_status_idx" key "learnerId" "status"
}

apply_projects() {
  local c="projects"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "title" 255 true
  create_text     "$c" "summary" false
  create_text     "$c" "goal" false
  create_string   "$c" "status" 64 true
  create_string   "$c" "source" 64 true
  create_enum     "$c" "skillLevel" false foundation intermediate advanced pro
  create_string   "$c" "challengeLevel" 64 false
  create_datetime "$c" "startDate" true
  create_datetime "$c" "targetDate" false
  create_datetime "$c" "completedAt" false
  create_text     "$c" "tagsJson" false
  create_text     "$c" "artifactIdsJson" false
  create_text     "$c" "reflectionIdsJson" false
  create_datetime "$c" "lastWorkedAt" false
  create_text     "$c" "externalPlatformIdsJson" false
  create_index    "$c" "projects_learner_status_idx" key "learnerId" "status"
  create_string   "$c" "podId" 255 false
}

apply_project_steps() {
  local c="project_steps"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "projectId" 64 true
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "title" 255 true
  create_text     "$c" "description" false
  create_string   "$c" "status" 64 true
  create_integer  "$c" "orderIndex" false
  create_string   "$c" "linkedBlockId" 255 false
  create_string   "$c" "linkedPlatformId" 255 false
  create_datetime "$c" "dueDate" false
  create_datetime "$c" "completedAt" false
  create_text     "$c" "evidenceArtifactIdsJson" false
  create_text     "$c" "notes" false
  create_index    "$c" "project_steps_project_idx" key "projectId"
}

apply_reflection_entries() {
  local c="reflection_entries"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "projectId" 64 false
  create_string   "$c" "externalSessionId" 255 false
  create_string   "$c" "blockId" 255 false
  create_string   "$c" "blockTitle" 255 false
  create_datetime "$c" "date" true
  create_text     "$c" "prompt" false
  create_text     "$c" "whatLearned" true
  create_text     "$c" "challenge" false
  create_text     "$c" "nextStep" false
  create_integer  "$c" "confidence" false
  create_text     "$c" "notes" false
  create_text     "$c" "quizAnswersJson" false
  create_text     "$c" "evidenceArtifactIdsJson" false
  create_text     "$c" "tagsJson" false
  create_index    "$c" "reflection_learner_date_idx" key "learnerId" "date"
}

apply_external_activity_sessions() {
  local c="external_activity_sessions"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "projectId" 64 false
  create_string   "$c" "platformId" 255 true
  create_string   "$c" "platformName" 255 true
  create_string   "$c" "title" 255 true
  create_text     "$c" "description" false
  create_url      "$c" "launchUrl" false
  create_datetime "$c" "scheduledDate" true
  create_string   "$c" "scheduledStartTime" 32 false
  create_integer  "$c" "durationMinutes" false
  create_string   "$c" "status" 64 false
  create_string   "$c" "syncMode" 64 false
  create_string   "$c" "importedAccountLabel" 255 false
  create_text     "$c" "notes" false
  create_string   "$c" "reflectionId" 64 false
  create_text     "$c" "evidenceArtifactIdsJson" false
  create_text     "$c" "tagsJson" false
  create_datetime "$c" "completedAt" false
  create_string   "$c" "blockId" 255 false
  create_datetime "$c" "lastSyncedAt" false
  create_index    "$c" "external_sessions_learner_date_idx" key "learnerId" "scheduledDate"
}

apply_achievement_unlocks() {
  local c="achievement_unlocks"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "achievementId" 255 true
  create_datetime "$c" "unlockedAt" true
  create_string   "$c" "sourceType" 64 false
  create_string   "$c" "sourceId" 255 false
  create_integer  "$c" "pointsAwarded" false
  create_index    "$c" "achievements_learner_idx" key "learnerId"
}

apply_planning_rules() {
  local c="planning_rules"
  create_string   "$c" "legacyPocketBaseId" 64 false
  create_string   "$c" "familyId" 64 true
  create_string   "$c" "learnerId" 64 true
  create_string   "$c" "name" 255 true
  create_string   "$c" "status" 64 false
  create_string   "$c" "primaryPodId" 255 false
  create_text     "$c" "supportPodIdsJson" false
  create_text     "$c" "preferredPlatformIdsJson" false
  create_integer  "$c" "weeklyProjectSessions" false
  create_integer  "$c" "weeklyExternalSessions" false
  create_boolean  "$c" "includeMovement" false
  create_boolean  "$c" "includeFrench" false
  create_boolean  "$c" "includeWriting" false
  create_string   "$c" "challengeLevel" 64 false
  create_datetime "$c" "periodStart" true
  create_datetime "$c" "periodEnd" false
  create_index    "$c" "planning_rules_learner_status_idx" key "learnerId" "status"
}

run_section() {
  case "$1" in
    families) apply_families ;;
    learners) apply_learners ;;
    schedules) apply_schedules ;;
    blocks) apply_blocks ;;
    artifacts) apply_artifacts ;;
    progress) apply_progress ;;
    competencies) apply_competencies ;;
    points) apply_points ;;
    rewards_redemptions) apply_rewards_redemptions ;;
    projects) apply_projects ;;
    project_steps) apply_project_steps ;;
    reflection_entries) apply_reflection_entries ;;
    external_activity_sessions) apply_external_activity_sessions ;;
    achievement_unlocks) apply_achievement_unlocks ;;
    planning_rules) apply_planning_rules ;;
    *)
      echo "Unknown schema section: $1" >&2
      return 1
      ;;
  esac
}

main() {
  if [ "$#" -gt 0 ]; then
    for section in "$@"; do
      run_section "$section"
    done
    echo "Appwrite schema applied."
    return
  fi

  run_section families
  run_section learners
  run_section schedules
  run_section blocks
  run_section artifacts
  run_section progress
  run_section competencies
  run_section points
  run_section rewards_redemptions
  run_section projects
  run_section project_steps
  run_section reflection_entries
  run_section external_activity_sessions
  run_section achievement_unlocks
  run_section planning_rules
  echo "Appwrite schema applied."
}

main "$@"
