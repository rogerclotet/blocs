#!/usr/bin/env node
/**
 * Print release context or bump package.json and app.json together.
 *
 *   node bump-version.mjs
 *   node bump-version.mjs bump patch|minor|major|X.Y.Z [--dry-run]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = execSync("git rev-parse --show-toplevel", {
  encoding: "utf8",
}).trim();
const packagePath = path.join(repoRoot, "package.json");
const appPath = path.join(repoRoot, "app.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function git(args, options = {}) {
  return execSync(`git ${args}`, {
    encoding: "utf8",
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function parseSemver(raw) {
  const match = String(raw)
    .trim()
    .replace(/^v/, "")
    .match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? 0),
  };
}

function formatSemver({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function compareSemver(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

function bumpSemver(current, kind) {
  if (kind === "major") {
    return { major: current.major + 1, minor: 0, patch: 0 };
  }
  if (kind === "minor") {
    return { major: current.major, minor: current.minor + 1, patch: 0 };
  }
  if (kind === "patch") {
    return { major: current.major, minor: current.minor, patch: current.patch + 1 };
  }
  const exact = parseSemver(kind);
  if (!exact) {
    throw new Error(`Unknown bump "${kind}". Use patch, minor, major, or X.Y.Z.`);
  }
  return exact;
}

function listTags() {
  const output = git("tag --list");
  if (!output) {
    return [];
  }
  return output.split("\n").filter(Boolean);
}

function collectContext() {
  const pkg = readJson(packagePath);
  const app = readJson(appPath);
  const packageVersion = pkg.version;
  const expoVersion = app.expo?.version;
  const androidVersionCode = app.expo?.android?.versionCode;
  const parsedPackage = parseSemver(packageVersion);
  const tags = listTags()
    .map((tag) => {
      const semver = parseSemver(tag);
      return semver ? { tag, semver, version: formatSemver(semver) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => compareSemver(a.semver, b.semver));
  const latestTag = tags.at(-1) ?? null;
  const currentVersionTags = tags.filter(
    (tag) => tag.version === formatSemver(parsedPackage ?? { major: 0, minor: 0, patch: 0 }),
  );
  const rangeStart = latestTag?.tag;
  const commitsSinceLatestTag = rangeStart
    ? git(`log ${rangeStart}..HEAD --pretty=format:%h%x09%s`)
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, ...rest] = line.split("\t");
          return { hash, subject: rest.join("\t") };
        })
    : [];

  return {
    packageVersion,
    expoVersion,
    androidVersionCode,
    versionsMatch: packageVersion === expoVersion,
    latestTag: latestTag?.tag ?? null,
    latestTagVersion: latestTag?.version ?? null,
    currentVersionTags: currentVersionTags.map((tag) => tag.tag),
    currentVersionTagged: currentVersionTags.length > 0,
    branch: git("rev-parse --abbrev-ref HEAD"),
    dirty: git("status --porcelain").length > 0,
    commitsSinceLatestTag,
  };
}

function applyBump(kind, dryRun) {
  const pkg = readJson(packagePath);
  const app = readJson(appPath);
  const current = parseSemver(pkg.version);
  if (!current) {
    throw new Error(`package.json version "${pkg.version}" is not semver.`);
  }
  if (app.expo?.version !== pkg.version) {
    throw new Error(
      `package.json (${pkg.version}) and app.json (${app.expo?.version}) versions differ. Sync them first.`,
    );
  }

  const next = bumpSemver(current, kind);
  const nextVersion = formatSemver(next);
  const nextCode = Number(app.expo.android.versionCode) + 1;
  if (!Number.isInteger(nextCode) || nextCode <= 0) {
    throw new Error(`android.versionCode "${app.expo.android.versionCode}" is not a positive integer.`);
  }
  if (compareSemver(next, current) <= 0) {
    throw new Error(`Next version ${nextVersion} must be greater than ${pkg.version}.`);
  }

  pkg.version = nextVersion;
  app.expo.version = nextVersion;
  app.expo.android.versionCode = nextCode;

  if (!dryRun) {
    writeJson(packagePath, pkg);
    writeJson(appPath, app);
  }

  return {
    previousVersion: formatSemver(current),
    version: nextVersion,
    previousVersionCode: nextCode - 1,
    androidVersionCode: nextCode,
    dryRun,
    files: ["package.json", "app.json"],
  };
}

const [, , command, bumpKind, maybeDryRun] = process.argv;
const dryRun = [command, bumpKind, maybeDryRun].includes("--dry-run");

try {
  if (!command || command === "context") {
    process.stdout.write(`${JSON.stringify(collectContext(), null, 2)}\n`);
  } else if (command === "bump") {
    if (!bumpKind || bumpKind === "--dry-run") {
      throw new Error("Usage: bump-version.mjs bump patch|minor|major|X.Y.Z [--dry-run]");
    }
    process.stdout.write(`${JSON.stringify(applyBump(bumpKind, dryRun), null, 2)}\n`);
  } else {
    throw new Error(`Unknown command "${command}". Use context or bump.`);
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
