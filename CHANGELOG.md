# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-09-04

### Changed

- Rebuilt Blocs in Expo and React Native so the same game runs on Android, iOS, and the web.
- Replaced the Unity Android pipeline with GitHub Actions builds that attach a sideloadable APK to git tags.

### Removed

- Unity project files, GitLab CI, and the old native Android release tooling.

Android releases before 2.0.0 were Unity builds tagged `1.08` through `1.22` and are not listed here.

[Unreleased]: https://github.com/rogerclotet/blocs/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/rogerclotet/blocs/compare/1.22...v2.0.0
