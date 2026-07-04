#!/usr/bin/env bash

set -euo pipefail

echo "Building Android app bundle for $BUILD_NAME"

export BUILD_PATH="$UNITY_DIR/Builds/$BUILD_TARGET/"
mkdir -p "$BUILD_PATH"

${UNITY_EXECUTABLE:-xvfb-run --auto-servernum --server-args='-screen 0 640x480x24' unity-editor} \
  -projectPath "$UNITY_DIR" \
  -quit \
  -batchmode \
  -nographics \
  -buildTarget "$BUILD_TARGET" \
  -customBuildTarget "$BUILD_TARGET" \
  -customBuildName "$BUILD_NAME" \
  -customBuildPath "$BUILD_PATH" \
  -executeMethod BuildCommand.PerformBuild \
  -logFile /dev/stdout

UNITY_EXIT_CODE=$?

if [ "$UNITY_EXIT_CODE" -eq 0 ]; then
  echo "Build succeeded"
else
  echo "Build failed with exit code $UNITY_EXIT_CODE"
  exit "$UNITY_EXIT_CODE"
fi

ls -la "$BUILD_PATH"
test -n "$(ls -A "$BUILD_PATH")"
