---
sidebar_position: 6
title: Releasing
---

Releases are built by CI. To publish one, run `just version patch` (or `minor`
or `major`) on a clean `main`, then `just version-push` to push the version
commit and its tag. Only pushing a tag that starts with `v` (for example
`v1.2.3`) triggers a release.

Publishing runs in `.github/workflows/ci.yml`: tests on every push and PR, then
on a `v*` tag a publish job releases the packages to JSR and npm.

## Pipeline

![Release pipeline](/img/release-flow.svg)
