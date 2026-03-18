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

APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT%/}"
APPWRITE_BUCKET_ID="${APPWRITE_BUCKET_ID:-learner-artifacts}"
APPWRITE_BUCKET_MAX_FILE_SIZE="${APPWRITE_BUCKET_MAX_FILE_SIZE:-52428800}"
APPWRITE_BUCKET_ANTIVIRUS="${APPWRITE_BUCKET_ANTIVIRUS:-}"

current_bucket="$(
  curl -sS \
    -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    "$APPWRITE_ENDPOINT/storage/buckets/$APPWRITE_BUCKET_ID"
)"

payload="$(
  echo "$current_bucket" | jq -c \
    --argjson max "$APPWRITE_BUCKET_MAX_FILE_SIZE" \
    --arg antivirusOverride "$APPWRITE_BUCKET_ANTIVIRUS" '{
    name,
    permissions: (.permissions // []),
    fileSecurity,
    enabled,
    maximumFileSize: $max,
    allowedFileExtensions: (.allowedFileExtensions // []),
    compression,
    encryption,
    antivirus: (
      if $antivirusOverride == "" then
        .antivirus
      else
        ($antivirusOverride == "true")
      end
    )
  }'
)"

curl -sS \
  -X PUT \
  -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" \
  -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$APPWRITE_ENDPOINT/storage/buckets/$APPWRITE_BUCKET_ID"

echo
echo "Updated bucket $APPWRITE_BUCKET_ID to maximumFileSize=$APPWRITE_BUCKET_MAX_FILE_SIZE"
