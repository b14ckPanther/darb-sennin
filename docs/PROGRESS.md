# Progress ledger

Read this first after every context reset (then `git log --oneline -20`). If this file and `git log` disagree, `git log` wins; fix this file first.

## Current state

- **Phase:** 1 done (spec approved). Next: Phase 2 (design system).
- **Branch:** `phase/01-spec`; `main` holds Phase 0 and the brand set (merged locally, not pushed).
- **Authority:** Nour delegated Phase 1 answers, Phase 2 design choices and local merges of finished phases to Claude on 2026-10-26 ("any choice by u will be approved from my side"). Outward actions still need Nour (`docs/REVIEW_FOR_NOUR.md`).
- **Overall:** 6%

## Phases

| # | Phase | Weight | Status | Commit range | Nour approved |
|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 4 | done, merged locally (9249444) | b15d4e1..80696d1 | merge decided by Claude under Nour's delegation (2026-10-26) |
| 1 | Confirm the spec | 2 | done | see git log `phase/01-spec` | spec decided by Claude under Nour's delegation (2026-10-26) |
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
| 2026-10-26 | 2 (proposal) | Three Verdict Sheet directions as a static page, marked "Proposal, not approved" | see git log | visual check at 1400 px and 390 px | frontend-design | `docs/proposals/phase-02-directions.html`; Inter swapped out per font rule; not a Phase 2 start |
| 2026-10-26 | 0 | Clean-clone verification, docs, rulings, Phase 1 review file | see git log | clean clone: 23/23 .NET, 2/2 Vitest, 4/4 Playwright, 3/3 shell test files | superpowers:verification-before-completion | `docs/REVIEW_FOR_NOUR.md` |
| 2026-10-26 | 0 | Full Phase 0 check re-run, merge into local `main` | 9249444 | 23/23 .NET, 2/2 Vitest, 4/4 Playwright + axe, 3/3 shell test files, emoji and attribution clean | superpowers:verification-before-completion, superpowers:finishing-a-development-branch | Merge decided by Claude under Nour's delegation (2026-10-26). Playwright browser installed to a session cache because another session held the shared cache lock |
| 2026-10-26 | brand | Enso brand set committed on `brand/enso`, merged locally | a0e97bf, e7e61b7 | emoji scan of brand text files clean | n/a | Approved by Nour (direction D) before this session |
| 2026-10-26 | 1 | Recommendations re-read, five changed, spec written, ADR-025..040, docs updated, C# 14 | see git log | `dotnet build -warnaserror` 0 warnings, 23/23 .NET after LangVersion 14 | claude-api, writing-guidelines, superpowers:verification-before-completion | Decided by Claude under Nour's delegation (2026-10-26); `docs/specs/2026-10-26-phase-01-product-spec.md` |

## Screen approvals (Phases 2-3, and any later UI change)

| Date | Screen / component | Viewport(s) | Nour's verdict | Notes |
|---|---|---|---|---|
| | | | | |

## Rulings

Decisions the agent made without Nour, cheapest reversible option. Each must say **cost if wrong**. High cost means stop and ask instead.

| Date | Ruling | Why | Cost if wrong | Status |
|---|---|---|---|---|
| 2026-10-26 | .NET SDK 10.0.403, net10.0, LangVersion 13 (ADR-020) | Q2 proposal + PLAN task 4 | low | accepted in Phase 1 (decided by Claude under Nour's delegation, 2026-10-26) |
| 2026-10-26 | xUnit v3 on Microsoft.Testing.Platform; `dotnet test --project <path>` (ADR-021) | .NET 10 SDK dropped the VSTest path for MTP projects | low | accepted in Phase 1 (decided by Claude under Nour's delegation, 2026-10-26) |
| 2026-10-26 | MongoDB image from `SENNIN_MONGO_IMAGE`, `mongo:8.2` (ADR-022) | 8.0.x/8.3 exit on Docker Desktop kernel 7.0.12 (SERVER-121912) | low | accepted in Phase 1 (decided by Claude under Nour's delegation, 2026-10-26) |
| 2026-10-26 | Service Bus emulator runs on Apple Silicon; no skip (ADR-023) | arm64 images exist, smoke green | low | accepted in Phase 1 (decided by Claude under Nour's delegation, 2026-10-26) |
| 2026-10-26 | Compose via `--env-file .env` + `tools/compose-up.sh`; perl emoji check; ESLint strict; Node 24 in CI; MIT; repo path (ADR-024) | plan defaults or cheapest reversible option | low | accepted in Phase 1 (decided by Claude under Nour's delegation, 2026-10-26) |
