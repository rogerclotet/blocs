#!/usr/bin/env bash

set -euo pipefail

UNITY_BUILDER=../unity-builder

retry_with_backoff() {
  local cmd="$1"
  local max_retries=5
  local delay=15
  local retry_count=0

  set +e
  while [[ $retry_count -lt $max_retries ]]; do
    eval "$cmd"
    local exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
      set -e
      return 0
    fi

    ((retry_count++))
    echo "Command failed, retry #$retry_count in $delay seconds..."
    sleep $delay
    delay=$((delay * 2))
  done
  set -e

  echo "Activation failed after $max_retries retries."
  return 1
}

setup_personal_license() {
  local license_dir="/root/.local/share/unity3d/Unity"
  mkdir -p "$license_dir"

  if [[ -n "${UNITY_LICENSE_BASE64:-}" ]]; then
    echo "$UNITY_LICENSE_BASE64" | base64 -d > "$license_dir/Unity_lic.ulf"
  elif [[ -n "${UNITY_LICENSE:-}" ]]; then
    # Fallback for unmasked variables: remove newlines/tabs only.
    tr -d '\r\n\t' <<< "$UNITY_LICENSE" > "$license_dir/Unity_lic.ulf"
  else
    echo "UNITY_LICENSE_BASE64 or UNITY_LICENSE must be set."
    exit 1
  fi

  echo "Installed personal Unity license file."
}

setup_android_signing() {
  if [[ -z "${ANDROID_KEYSTORE_BASE64:-}" ]]; then
    echo "ANDROID_KEYSTORE_BASE64 not set; Android build will use Unity debug keystore."
    return
  fi

  echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > "$UNITY_DIR/keystore.keystore"
  echo "Decoded Android keystore to $UNITY_DIR/keystore.keystore"
}

if [ ! -d "$UNITY_BUILDER" ]; then
  git clone https://github.com/game-ci/unity-builder.git --depth 1 --branch v4.1.3 "$UNITY_BUILDER"
  cd "$UNITY_BUILDER" && git verify-commit v4.1.3 && cd -
fi

setup_android_signing

if [[ -n "${UNITY_LICENSE_BASE64:-}" || -n "${UNITY_LICENSE:-}" ]]; then
  setup_personal_license
  echo "Personal license installed."
elif [[ -n "${UNITY_SERIAL:-}" && -n "${UNITY_EMAIL:-}" && -n "${UNITY_PASSWORD:-}" ]]; then
  echo "Requesting activation by serial number"
  retry_with_backoff "unity-editor \
    -logFile /dev/stdout \
    -quit \
    -batchmode \
    -nographics \
    -serial \"$UNITY_SERIAL\" \
    -username \"$UNITY_EMAIL\" \
    -password \"$UNITY_PASSWORD\" \
    -projectPath \"$UNITY_BUILDER/dist/BlankProject\""
elif [[ -n "${UNITY_LICENSING_SERVER:-}" ]]; then
  license_file=$(mktemp)
  trap 'rm -f "$license_file"' EXIT
  /opt/unity/Editor/Data/Resources/Licensing/Client/Unity.Licensing.Client --acquire-floating > "$license_file"
  PARSED_FILE=$(grep -oP '\".*?\"' < "$license_file" | tr -d '"')
  export FLOATING_LICENSE=$(sed -n 2p <<< "$PARSED_FILE")
  export FLOATING_LICENSE_TIMEOUT=$(sed -n 4p <<< "$PARSED_FILE")
  echo "Acquired floating license."
else
  echo "No Unity license activation strategy matched."
  echo "Set UNITY_LICENSE_BASE64 (recommended), UNITY_LICENSE (unmasked),"
  echo "or UNITY_SERIAL + UNITY_EMAIL + UNITY_PASSWORD (pro),"
  echo "or UNITY_LICENSING_SERVER (floating)."
  exit 1
fi

echo "CI before_script complete."
