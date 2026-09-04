---
name: create-release
description: Cut a Blocs release by choosing patch, minor, or major, updating CHANGELOG.md, package.json, and app.json, then committing and creating the vX.Y.Z git tag. Use when the user asks to create a release, bump the version, tag a version, or ship a new build.
---

# Create a Blocs release

Prepare a version bump, changelog, commit, and git tag. Do not push the tag unless the user explicitly asks; pushing a `v*` tag starts the Android APK release workflow.

## Preconditions

1. Run the helper from the repo root:

   ```sh
   node .agents/skills/create-release/scripts/bump-version.mjs
   ```

2. Fetch tags if the network is available: `git fetch --tags origin`.
3. Stop if `package.json` and `app.json` versions differ. Sync them before continuing.
4. Prefer `main`. If HEAD is another branch, say so and ask before releasing from it.
5. Stop if the working tree has unrelated dirty files. A release commit should contain only version files and the changelog.
6. Run `pnpm typecheck` and `pnpm test`. Stop on failure.

## Decide the bump

Use the user's requested bump type when they give one. Otherwise classify **user-visible changes since the latest version tag**:

| Bump | When |
| --- | --- |
| **major** | Breaking player-facing change: incompatible saves, removed features, package-id change, or a new generation of the app. |
| **minor** | New player-facing capability: modes, pieces, screens, themes, languages, platforms. |
| **patch** | Bug fixes, visual polish, performance, refactors, CI, docs, or dependency updates. |

Take the highest applicable bump. Ignore merge commits when judging intent. If there is nothing worth shipping, stop.

If `currentVersionTagged` is false, the version in `package.json` was never tagged:

- Tag it as-is when that version is what should ship and there is no newer work that warrants a bump.
- Otherwise bump from that version using the table above.
- Tagging the current version as-is must **not** increment `android.versionCode` and must **not** rewrite `package.json` / `app.json` unless they are already wrong.

Show a short plan and wait for confirmation unless the user already told you to proceed:

- bump type and why
- current version → next version
- current `versionCode` → next `versionCode` (always +1 on a bump)
- tag name (`vX.Y.Z`)
- changelog summary

## Update files

For a bump, run:

```sh
node .agents/skills/create-release/scripts/bump-version.mjs bump <patch|minor|major|X.Y.Z>
```

That writes the same semver to `package.json` and `app.json` `expo.version`, and increments `expo.android.versionCode` by 1.

Then edit `CHANGELOG.md`:

1. Keep [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) headings: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Omit empty headings.
2. Move items out of `## [Unreleased]` into `## [X.Y.Z] - YYYY-MM-DD`.
3. Write the notes from the commits and diff, in player-facing language. Do not dump raw commit subjects.
4. Leave an empty `## [Unreleased]` section at the top.
5. Update the compare links at the bottom. New releases use `v` tags (`v2.0.1`). Legacy tags `1.08`–`1.22` have no `v` prefix. If an older version was never tagged, point its compare URL at the nearest tags that exist.

Do not change other version-like strings unless they would ship a lie (for example a hardcoded current version in docs).

## Commit and tag

1. Stage only `package.json`, `app.json`, and `CHANGELOG.md`.
2. Commit as `Release X.Y.Z` (historical style in this repo).
3. Create an annotated tag on that commit:

   ```sh
   git tag -a "vX.Y.Z" -m "Blocs X.Y.Z"
   ```

4. Do not use lightweight tags, move an existing tag, or force-push.
5. Do not run `gh release create`. The Android workflow creates the GitHub Release when the tag is pushed.

## Finish

Report the bump type, version, `versionCode`, tag, commit, and that the tag is local-only.

To publish (only if the user asks):

```sh
git push origin HEAD
git push origin vX.Y.Z
```

Pushing `vX.Y.Z` builds `blocs-X.Y.Z.apk` and attaches it to the GitHub Release.
