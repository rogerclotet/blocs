#!/usr/bin/env bash

set -euo pipefail

AAB_PATH="${AAB_PATH:-$CI_PROJECT_DIR/Builds/Android/Blocs.aab}"
PLAY_STORE_TRACK="${PLAY_STORE_TRACK:-internal}"
PLAY_STORE_RELEASE_STATUS="${PLAY_STORE_RELEASE_STATUS:-completed}"
PACKAGE_NAME="${PACKAGE_NAME:-dev.clotet.Blocs}"
JSON_KEY_PATH="$CI_PROJECT_DIR/play-store-key.json"

if [[ -z "${GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:-}" ]]; then
  echo "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not set."
  exit 1
fi

if [[ ! -f "$AAB_PATH" ]]; then
  echo "AAB not found at $AAB_PATH"
  exit 1
fi

printf '%s' "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" > "$JSON_KEY_PATH"

bundle install --path vendor/bundle

bundle exec fastlane android deploy \
  aab_path:"$AAB_PATH" \
  package_name:"$PACKAGE_NAME" \
  track:"$PLAY_STORE_TRACK" \
  release_status:"$PLAY_STORE_RELEASE_STATUS" \
  json_key_path:"$JSON_KEY_PATH"
