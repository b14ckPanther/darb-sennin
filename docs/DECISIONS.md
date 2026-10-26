# Decisions (ADR log)

Format: number, title, status (`fixed` = from Nour's roadmap or rules; `proposed` = confirm with Nour in Phase 1; `accepted` / `rejected` after Phase 1), context, decision, consequences. Add new ADRs at the bottom; never rewrite an accepted one, supersede it.

## ADR-001 Stack: C#, ASP.NET Core, MongoDB, Azure — fixed
Context: roadmap; mirrors ChargeAfter's .NET intern role. Decision: C# 13 language level or newer (see ADR-013), ASP.NET Core minimal APIs, MongoDB, Azure. Consequences: all services are .NET; the web client is the only non-.NET part.

## ADR-002 User code runs only in hardened Docker sandboxes — fixed
Context: brief. Decision: one throwaway container per run, `--network none`, CPU/memory/pids/wall-clock limits, custom seccomp, read-only root, non-root user, all caps dropped, enforced by a profile validator (`SECURITY.md`). Consequences: judge needs a Docker host; Azure Container Apps alone cannot host it.

## ADR-003 Evidence on every grade; praise gated by data — fixed
Context: signature and brief ("honest, never flatters"). Decision: scores computed deterministically before any LLM call; every finding must cite an evidence id; praise appears only when a data-defined gate passes. Consequences: the LLM can explain but cannot score.

## ADR-004 Problems, hidden tests and ranks live in data — fixed
Context: Rule 2 and brief. Decision: `content/` + `config/` validated by JSON Schema and imported into MongoDB. Consequences: a content CLI and schemas are first-class code.

## ADR-005 UI first — fixed
Context: Rule 3. Decision: Phase 2 design system and Phase 3 prototype on seed data before any sandbox or backend work. Consequences: API DTOs are defined by the prototype's TypeScript interface first.

## ADR-006 Azure Service Bus for judge jobs — fixed (skill list)
Decision: `judge-jobs` and `judge-results` queues; local Service Bus emulator. Consequences: emulator needs `azure-sql-edge` locally.

## ADR-007 SignalR for live verdicts — fixed (skill list)
Decision: per-case progress over SignalR. Consequences: the signature animation is driven by real events, not a fake delay.

## ADR-008 xUnit for tests — fixed (skill list)
Decision: xUnit v3, Testcontainers, Shouldly (FluentAssertions v8 licence change; avoid). Status of Shouldly: proposed.

## ADR-009 No AI attribution, Nour as sole author — fixed
Decision: git config, commit-msg hook, agent settings, push checks (`CLAUDE.md` §1.1, §8).

## ADR-010 Judge separated from API on its own host — proposed
Context: Docker socket is root-equivalent. Decision: judge worker on a dedicated host with read-only DB access and no LLM key. Cost if wrong: medium (merging later is easy; splitting later is hard).

## ADR-011 Expected outputs never enter the sandbox — proposed
Decision: stdin-in, stdout-out, comparison in the judge. Cost if wrong: high (leaks tests), so it is the default.

## ADR-012 Complexity is measured, not inferred — proposed
Decision: run growing sizes, fit log-log slope from cgroup CPU time; show slope and R², label "measured". Cost if wrong: low.

## ADR-013 Target .NET 10 LTS — proposed (Q2)
Context: .NET 9 (C# 13) support ends 10 Nov 2026. Decision: `net10.0`; C# 13 features all available. Cost if wrong: low (retarget in `global.json` and props).

## ADR-014 React 19 + Vite + TypeScript web client — proposed (Q19)
Cost if wrong: high after Phase 3, low before. Settle in Phase 1.

## ADR-015 Hidden tests in a private content repo — proposed (Q5)
Cost if wrong: low.

## ADR-016 Judge on an Azure VM with rootless Docker + gVisor — proposed (Q9)
Cost if wrong: medium (sandbox code is behind `ISandbox`; a dynamic-sessions implementation can be added).

## ADR-017 Events follow Darb Budokai's CloudEvents + JSON Schema contract — proposed (Q12)
Cost if wrong: low (adapter is isolated and optional).

## ADR-018 CodeMirror 6 as the editor — proposed
Context: Monaco is heavy and weak on mobile; CodeMirror 6 is accessible, small, works on phones. Cost if wrong: low.

## ADR-019 One SVG icon set, no emoji — fixed (Rule 11)
Decision: Solar (Iconify) or Lucide, chosen in Phase 2; `tools/check-emoji.sh` in CI.

## Phase 0 rulings (agent, 2026-10-26) — ruling, confirm with Nour in Phase 1

Nour was away during Phase 0. Each ruling below takes the plan's proposed default or the cheapest reversible option, and is listed again in `docs/REVIEW_FOR_NOUR.md`.

## ADR-020 .NET SDK 10.0.403 pinned, LangVersion 13 — ruling (Q2)
Context: Q2 proposes .NET 10 LTS; `PLAN.md` Phase 0 task 4 says `LangVersion 13`. Decision: `global.json` pins SDK 10.0.403 with `rollForward: latestFeature`; all projects target `net10.0` with `LangVersion 13`. Installed user-locally at `~/.dotnet` with Microsoft's `dotnet-install.sh`. Cost if wrong: low (one line in `global.json`, one in `Directory.Build.props`; moving to C# 14 is a superset).

## ADR-021 xUnit v3 on Microsoft.Testing.Platform — ruling
Context: the .NET 10 SDK no longer runs Microsoft.Testing.Platform test projects through the old VSTest path, and xUnit v3 4.x is built on it. Decision: `xunit.v3.mtp-v2`, opted in through `global.json` (`"test": {"runner": "Microsoft.Testing.Platform"}`). One project runs with `dotnet test --project tests/<Name>` (the bare-path form in older docs no longer works); `dotnet test` at the root runs all. Shouldly for assertions (ADR-008). Cost if wrong: low.

## ADR-022 MongoDB image is config, pinned to mongo:8.2 locally — ruling
Context: `mongo:8` (8.3.x) and `mongo:8.0.34` exit at startup on Linux kernels 6.19 to 7.0.13 (MongoDB SERVER-121912, TCMalloc and rseq). Docker Desktop on Nour's Mac runs kernel 7.0.12. `mongo:8.2` starts and passes the smoke tests. Decision: compose reads `SENNIN_MONGO_IMAGE` from `.env`; `.env.example` sets `mongo:8.2`. Still MongoDB 8 (ADR-001). Revisit when Docker Desktop ships kernel 7.0.14 or later. Cost if wrong: low (one env value).

## ADR-023 Service Bus emulator runs natively on Apple Silicon — ruling
Context: the plan allowed skipping the emulator smoke test on Apple Silicon. Both `servicebus-emulator` and `azure-sql-edge` publish arm64 images, and the round-trip test passes on both queues, so nothing is skipped. Note: Microsoft retired Azure SQL Edge in September 2025; the image still pulls and works. If it stops, swap to `mcr.microsoft.com/mssql/server` (amd64 only, runs under Rosetta). Cost if wrong: low.

## ADR-024 Tooling details chosen in Phase 0 — ruling
- Compose reads the repo-root `.env` through `--env-file .env`; `tools/compose-up.sh` starts the stack and waits until Mongo is primary and the emulator's `/health` is healthy.
- `tools/check-emoji.sh` uses `perl` (macOS grep has no `-P`) with the same code-point ranges, and also scans `tests/`.
- Web lint is ESLint with `typescript-eslint` `strictTypeChecked` (the current Vite template ships oxlint; `CONVENTIONS.md` asks for ESLint). CI uses Node 24 LTS.
- The no-magic-number guard uses a small reflection scanner in `tests/DarbSennin.ArchitectureTests` (NetArchTest cannot read constant values); layering rules use NetArchTest.Rules.
- The web shell is a placeholder with no chosen typeface; fonts and tokens are a Phase 2 decision and nothing ships before then.
- Licence MIT (Q18 proposal); repo path `~/Documents/GitHub/darb-sennin` (Q21 proposal), no remote created.
Cost if wrong: low for each.
