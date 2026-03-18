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
APPWRITE_DATABASE_NAME="${APPWRITE_DATABASE_NAME:-LumiPods}"
APPWRITE_BUCKET_ID="${APPWRITE_BUCKET_ID:-learner-artifacts}"
APPWRITE_BUCKET_NAME="${APPWRITE_BUCKET_NAME:-Learner Artifacts}"
APPWRITE_BUCKET_MAX_FILE_SIZE="${APPWRITE_BUCKET_MAX_FILE_SIZE:-52428800}"

COLLECTION_IDS=(
  families
  learners
  schedules
  blocks
  artifacts
  progress
  competencies
  points
  rewards_redemptions
  projects
  project_steps
  reflection_entries
  external_activity_sessions
  achievement_unlocks
  planning_rules
)

configure_client() {
  appwrite client --endpoint "$APPWRITE_ENDPOINT"
  appwrite client --project-id "$APPWRITE_PROJECT_ID"
  appwrite client --key "$APPWRITE_API_KEY"
}

database_exists() {
  appwrite -j databases list | jq -e --arg id "$APPWRITE_DATABASE_ID" '.databases[]? | select(.$id == $id)' >/dev/null 2>&1
}

collection_exists() {
  local collection_id="$1"
  appwrite -j databases list-collections --database-id "$APPWRITE_DATABASE_ID" | jq -e --arg id "$collection_id" '.collections[]? | select(.$id == $id)' >/dev/null 2>&1
}

bucket_exists() {
  appwrite -j storage list-buckets | jq -e --arg id "$APPWRITE_BUCKET_ID" '.buckets[]? | select(.$id == $id)' >/dev/null 2>&1
}

create_database() {
  if database_exists; then
    echo "Database exists: $APPWRITE_DATABASE_ID"
    return
  fi

  echo "Creating database: $APPWRITE_DATABASE_ID"
  appwrite databases create \
    --database-id "$APPWRITE_DATABASE_ID" \
    --name "$APPWRITE_DATABASE_NAME" \
    --enabled true
}

create_collections() {
  for collection_id in "${COLLECTION_IDS[@]}"; do
    if collection_exists "$collection_id"; then
      echo "Collection exists: $collection_id"
      continue
    fi

    echo "Creating collection: $collection_id"
    appwrite databases create-collection \
      --database-id "$APPWRITE_DATABASE_ID" \
      --collection-id "$collection_id" \
      --name "$collection_id" \
      --document-security true \
      --enabled true
  done
}

create_bucket() {
  if bucket_exists; then
    echo "Bucket exists: $APPWRITE_BUCKET_ID"
    return
  fi

  echo "Creating bucket: $APPWRITE_BUCKET_ID"
  appwrite storage create-bucket \
    --bucket-id "$APPWRITE_BUCKET_ID" \
    --name "$APPWRITE_BUCKET_NAME" \
    --file-security true \
    --enabled true \
    --maximum-file-size "$APPWRITE_BUCKET_MAX_FILE_SIZE" \
    --compression none \
    --encryption true \
    --antivirus true \
    --transformations true
}

main() {
  configure_client
  create_database
  create_collections
  create_bucket
  echo "Appwrite bootstrap completed."
}

main "$@"
