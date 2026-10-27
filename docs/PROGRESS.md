# Progress ledger

Read this first after every context reset (then `git log --oneline -20`). If this file and `git log` disagree, `git log` wins; fix this file first.

## Current state

- **Phase:** 2 done (design system). Next: Phase 3 (clickable prototype), not started.
- **Branch:** `main` holds Phases 0, 1, 2 and the brand set, merged locally, not pushed.
- **Authority:** Nour delegated Phase 1 answers, Phase 2 design choices and local merges of finished phases to the agent on 2026-10-26 ("any choice by u will be approved from my side"). Outward actions still need Nour (`docs/REVIEW_FOR_NOUR.md`).
- **Overall:** 13%

## Phases

| # | Phase | Weight | Status | Commit range | Nour approved |
|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 4 | done, merged locally (9249444) | b15d4e1..80696d1 | merge decided by the agent under Nour's delegation (2026-10-26) |
| 1 | Confirm the spec | 2 | done | see git log `phase/01-spec` | spec decided by the agent under Nour's delegation (2026-10-26) |
| 2 | Design system | 7 | done | see git log `phase/02-design-system` | direction, components and merge decided by the agent under Nour's delegation (2026-10-26) |
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
| 2026-10-26 | 0 | Full Phase 0 check re-run, merge into local `main` | 9249444 | 23/23 .NET, 2/2 Vitest, 4/4 Playwright + axe, 3/3 shell test files, emoji and attribution clean | superpowers:verification-before-completion, superpowers:finishing-a-development-branch | Merge decided by the agent under Nour's delegation (2026-10-26). Playwright browser installed to a session cache because another session held the shared cache lock |
| 2026-10-26 | brand | Enso brand set committed on `brand/enso`, merged locally | a0e97bf, e7e61b7 | emoji scan of brand text files clean | n/a | Approved by Nour (direction D) before this session |
| 2026-10-26 | 1 | Recommendations re-read, five changed, spec written, ADR-025..040, docs updated, C# 14 | see git log | `dotnet build -warnaserror` 0 warnings, 23/23 .NET after LangVersion 14 | claude-api, writing-guidelines, superpowers:verification-before-completion | Decided by the agent under Nour's delegation (2026-10-26); `docs/specs/2026-10-26-phase-01-product-spec.md` |
| 2026-10-26 | 1 | Phase 1 merged into local `main` | 2a53350 | as above | superpowers:finishing-a-development-branch | Decided by the agent under Nour's delegation (2026-10-26) |
| 2026-10-27 | 2 | 2. Colour, type, space, radius, elevation, motion tokens + WCAG contrast test | 4bcb31b | contrast test red first (missing module), then 62 pairs green; red again on a weakened muted ink | frontend-design, design-taste-frontend, impeccable:impeccable, superpowers:test-driven-development | ADR-041 |
| 2026-10-27 | 2 | 3. Solar icons via one Icon component; lint rule against other icon packages; self-hosted fonts; base styles | 4e6b24a | Icon tests and lint-rule tests red first | solar-duotone-bold, superpowers:test-driven-development | ADR-042 |
| 2026-10-27 | 2 | 4. Copy from config; Button, Tag, EvidenceChip, TestRow, FindingNote, ScoreBreakdown, EmptyState, Toast | 6f90526 | 34 component tests, red first | superpowers:test-driven-development | ADR-044 |
| 2026-10-27 | 2 | 4. ComplexityPlot, Sheet (detents, focus trap), TabBar, LargeTitle, ListRow (swipe + keyboard) | 945c310 | 17 tests red first; ListRow keyboard test caught tray before row in tab order | dataviz, animation-systems (via motion tokens), superpowers:test-driven-development | |
| 2026-10-27 | 2 | 1, 4. Verdict Sheet, earned variant, Today and catalogue comps; PraiseLine; reduced-motion snapshots; e2e axe | 7a0eadb | reduced-motion tests fail with motion on; axe found aria-controls to missing ids, unfocusable scroll regions and vermilion text at 3.9:1, all fixed; 34 Playwright | impeccable:impeccable (detector clean), web-design-guidelines, dataviz | |
| 2026-10-27 | 2 | 5-6. Originality audit, ASSETS.md, direction recorded | see git log | marks byte-identical to `brand/exports`; no third-party names in shipped copy | audit-reference-originality, writing-guidelines | Clear in checked scope |
| 2026-10-27 | 2 | Whole-branch review (fresh-context reviewer) and fixes | see git log | 157 Vitest, 38 Playwright (run twice), lint and build clean; new tests red first for each fix | superpowers:requesting-code-review, superpowers:receiving-code-review, superpowers:test-driven-development | Fixed: the word the agent manual forbids removed from docs; swipe no longer opens a row, tap closes open actions, reduced motion keeps the gesture; sheet drags only from handle and header, 44 pt handle, focus on Close, scroll lock, still under reduced motion; LargeTitle safe-area; score breakdown is a disclosure (WCAG 1.4.13); toasts render into persistent live regions; critical severity; case times, line ranges and difficulty scale moved to data; ledger announces its progress line; theme applied before first paint |

## Screen approvals (Phases 2-3, and any later UI change)

| Date | Screen / component | Viewport(s) | Nour's verdict | Notes |
|---|---|---|---|---|
| 2026-10-27 | Design system: Verdict Sheet, earned variant, Today, catalogue | 1440 px and 390 px, light and dark (`docs/screenshots/phase-02/`) | Decided by the agent under Nour's delegation (2026-10-26); Nour may still revise | Phase 3 screens are approved one by one |

## Rulings

Decisions the agent made without Nour, cheapest reversible option. Each must say **cost if wrong**. High cost means stop and ask instead.

| Date | Ruling | Why | Cost if wrong | Status |
|---|---|---|---|---|
| 2026-10-26 | .NET SDK 10.0.403, net10.0, LangVersion 13 (ADR-020) | Q2 proposal + PLAN task 4 | low | accepted in Phase 1 (decided by the agent under Nour's delegation, 2026-10-26) |
| 2026-10-26 | xUnit v3 on Microsoft.Testing.Platform; `dotnet test --project <path>` (ADR-021) | .NET 10 SDK dropped the VSTest path for MTP projects | low | accepted in Phase 1 (decided by the agent under Nour's delegation, 2026-10-26) |
| 2026-10-26 | MongoDB image from `SENNIN_MONGO_IMAGE`, `mongo:8.2` (ADR-022) | 8.0.x/8.3 exit on Docker Desktop kernel 7.0.12 (SERVER-121912) | low | accepted in Phase 1 (decided by the agent under Nour's delegation, 2026-10-26) |
| 2026-10-26 | Service Bus emulator runs on Apple Silicon; no skip (ADR-023) | arm64 images exist, smoke green | low | accepted in Phase 1 (decided by the agent under Nour's delegation, 2026-10-26) |
| 2026-10-27 | Review minors deferred to Phase 3: ComplexityPlot clipping of both ends and empty or non-positive input guards; sheet `dragElastic` tuning; theme radiogroup arrow keys; landscape left/right safe areas on all bars; evidence jumps moving focus and highlighting cases and the probe; catalogue specimen strings into seed; phone e2e project with `hasTouch` and a target-size assertion; drag-logic unit tests | Each touches components Phase 3 rebuilds into real screens; none blocks the comps | low | ruling, decided by the agent under Nour's delegation (2026-10-26) |
| 2026-10-27 | Playwright browsers for local runs installed under a session cache (`PLAYWRIGHT_BROWSERS_PATH`) because another session held the shared cache lock | environment only, no repo change | low | ruling |
| 2026-10-26 | Compose via `--env-file .env` + `tools/compose-up.sh`; perl emoji check; ESLint strict; Node 24 in CI; MIT; repo path (ADR-024) | plan defaults or cheapest reversible option | low | accepted in Phase 1 (decided by the agent under Nour's delegation, 2026-10-26) |
