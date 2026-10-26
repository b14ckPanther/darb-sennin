# Progress ledger

Read this first after every context reset (then `git log --oneline -20`). If this file and `git log` disagree, `git log` wins; fix this file first.

## Current state

- **Phase:** 0 done on `phase/00-bootstrap` (local only, not merged, no remote). Next: Phase 1 (confirm the spec with Nour).
- **Branch:** `phase/00-bootstrap`; `main` holds only the planning package.
- **Blockers:** Phase 1 needs Nour's answers (`docs/REVIEW_FOR_NOUR.md`); merging to `main` needs Nour's "yes".
- **Overall:** 4% (Phase 0 complete, awaiting merge approval)

## Phases

| # | Phase | Weight | Status | Commit range | Nour approved |
|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 4 | done (awaiting merge) | b15d4e1..HEAD | pending |
| 1 | Confirm the spec | 2 | not started | | |
| 2 | Design system | 7 | proposals only (not approved) | | |
| 3 | Prototype on seed data | 12 | not started | | |
| 4 | Content and config model | 7 | not started | | |
| 5 | Sandbox and judge | 15 | not started | | |
| 6 | Grading and evidence | 10 | not started | | |
| 7 | Reviewer | 10 | not started | | |
| 8 | Progression | 9 | not started | | |
| 9 | Live wiring | 7 | not started | | |
| 10 | Azure deployment | 6 | not started | | |
| 11 | Darb Budokai integration (optional) | 3 | not started | | |
| 12 | Hardening | 5 | not started | | |
| 13 | Launch | 3 | not started | | |

## Task ledger

One row per completed task. "Skills" lists every skill invoked for the task.

| Date | Phase | Task | Commit | Tests | Skills | Notes |
|---|---|---|---|---|---|---|
| 2026-10-26 | 0 | 1. git init in place, Nour identity, planning package committed | 4f49a7f | n/a | superpowers:test-driven-development | `main` = planning package; work on `phase/00-bootstrap` |
| 2026-10-26 | 0 | 2-3. Agent attribution off; commit-msg hook | b15d4e1 | `tests/tools/commit-msg-hook.test.sh` (6 cases), watched fail first (hook missing) | superpowers:test-driven-development | |
| 2026-10-26 | 0 | 7. Emoji and attribution checks | 779f8fc | `check-emoji.test.sh` (4), `check-no-attribution.test.sh` (3), watched fail first | superpowers:test-driven-development | perl instead of grep -P (ADR-024) |
| 2026-10-26 | 0 | 4-6. SDK pin, props, CPM, editorconfig, solution skeleton, architecture tests | bdaae3e | 8 smoke + 12 architecture; smoke red on missing markers; magic-number guard red on planted `MemoryLimitMb = 256` in Domain, then removed | superpowers:test-driven-development | ADR-020, ADR-021 |
| 2026-10-26 | 0 | 8. Compose: MongoDB replica set, Service Bus emulator + SQL Edge | 7a853be | 3 integration smoke tests, red on missing env then green | superpowers:test-driven-development, superpowers:systematic-debugging | Mongo 8.3/8.0 crash on kernel 7.0.12, pinned 8.2 (ADR-022); emulator fine on arm64 (ADR-023) |
| 2026-10-26 | 0 | 9-11. Web scaffold, CI workflow, licence, ASSETS, PR template, .env.example | ca37368 | Vitest 2, Playwright + axe 4 (desktop and 390 px), red on missing heading/title first | superpowers:test-driven-development | CI not pushed (no remote) |
| 2026-10-26 | 0 | Clean-clone verification, docs, rulings, Phase 1 review file | see git log | clean clone: 23/23 .NET, 2/2 Vitest, 4/4 Playwright, 3/3 shell test files | superpowers:verification-before-completion | `docs/REVIEW_FOR_NOUR.md` |

## Screen approvals (Phases 2-3, and any later UI change)

| Date | Screen / component | Viewport(s) | Nour's verdict | Notes |
|---|---|---|---|---|
| | | | | |

## Rulings

Decisions the agent made without Nour, cheapest reversible option. Each must say **cost if wrong**. High cost means stop and ask instead.

| Date | Ruling | Why | Cost if wrong | Status |
|---|---|---|---|---|
| 2026-10-26 | .NET SDK 10.0.403, net10.0, LangVersion 13 (ADR-020) | Q2 proposal + PLAN task 4 | low | proposed, confirm with Nour |
| 2026-10-26 | xUnit v3 on Microsoft.Testing.Platform; `dotnet test --project <path>` (ADR-021) | .NET 10 SDK dropped the VSTest path for MTP projects | low | proposed, confirm with Nour |
| 2026-10-26 | MongoDB image from `SENNIN_MONGO_IMAGE`, `mongo:8.2` (ADR-022) | 8.0.x/8.3 exit on Docker Desktop kernel 7.0.12 (SERVER-121912) | low | proposed, confirm with Nour |
| 2026-10-26 | Service Bus emulator runs on Apple Silicon; no skip (ADR-023) | arm64 images exist, smoke green | low | proposed, confirm with Nour |
| 2026-10-26 | Compose via `--env-file .env` + `tools/compose-up.sh`; perl emoji check; ESLint strict; Node 24 in CI; MIT; repo path (ADR-024) | plan defaults or cheapest reversible option | low | proposed, confirm with Nour |
