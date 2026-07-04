#!/usr/bin/env bash

set -euo pipefail

if [[ -n "${UNITY_LICENSE_BASE64:-}" || -n "${UNITY_LICENSE:-}" ]]; then
  echo "Personal UNITY_LICENSE file does not require returning."
  exit 0
fi

if [[ -n "${UNITY_LICENSING_SERVER:-}" ]]; then
  if [[ -z "${FLOATING_LICENSE:-}" ]]; then
    echo "FLOATING_LICENSE is not set; nothing to return."
    exit 0
  fi

  /opt/unity/Editor/Data/Resources/Licensing/Client/Unity.Licensing.Client --return-floating "$FLOATING_LICENSE"
elif [[ -n "${UNITY_SERIAL:-}" ]]; then
  unity-editor \
    -logFile /dev/stdout \
    -quit \
    -batchmode \
    -nographics \
    -returnlicense \
    -username "$UNITY_EMAIL" \
    -password "$UNITY_PASSWORD" \
    -projectPath "../unity-builder/dist/BlankProject"
else
  echo "No license to return."
fi
