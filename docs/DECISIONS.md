# Decisions (ADR log)

Format: number, title, status (`fixed` = from Nour's roadmap or rules; `proposed` = confirm with Nour in Phase 1; `accepted` / `rejected` after Phase 1), context, decision, consequences. Add new ADRs at the bottom; never rewrite an accepted one, supersede it.

## ADR-001 Stack: C#, ASP.NET Core, MongoDB, Azure — fixed
Context: roadmap; mirrors Israeli fintech .NET roles (ADR-027). Decision: C# 13 language level or newer (see ADR-013), ASP.NET Core minimal APIs, MongoDB, Azure. Consequences: all services are .NET; the web client is the only non-.NET part.

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
Decision: xUnit v3, Testcontainers, Shouldly (FluentAssertions v8 licence change; avoid). Shouldly accepted in Phase 1.

## ADR-009 No AI attribution, Nour as sole author — fixed
Decision: git config, commit-msg hook, agent settings, push checks (`CLAUDE.md` §1.1, §8).

## ADR-010 Judge separated from API on its own host — accepted in Phase 1
Context: Docker socket is root-equivalent. Decision: judge worker on a dedicated host with read-only DB access and no LLM key. Cost if wrong: medium (merging later is easy; splitting later is hard).

## ADR-011 Expected outputs never enter the sandbox — accepted in Phase 1
Decision: stdin-in, stdout-out, comparison in the judge. Cost if wrong: high (leaks tests), so it is the default.

## ADR-012 Complexity is measured, not inferred — accepted in Phase 1
Decision: run growing sizes, fit log-log slope from cgroup CPU time; show slope and R², label "measured". Cost if wrong: low.

## ADR-013 Target .NET 10 LTS — accepted in Phase 1 (Q2)
Context: .NET 9 (C# 13) support ends 10 Nov 2026. Decision: `net10.0`; C# 13 features all available. Cost if wrong: low (retarget in `global.json` and props).

## ADR-014 React 19 + Vite + TypeScript web client — accepted in Phase 1 (Q19)
Cost if wrong: high after Phase 3, low before. Settle in Phase 1.

## ADR-015 Hidden tests in a private content repo — accepted in Phase 1 (Q5)
Cost if wrong: low.

## ADR-016 Judge on an Azure VM with rootless Docker + gVisor — accepted in Phase 1 (Q9)
Cost if wrong: medium (sandbox code is behind `ISandbox`; a dynamic-sessions implementation can be added).

## ADR-017 Events follow Darb Budokai's CloudEvents + JSON Schema contract — accepted in Phase 1 (Q12)
Cost if wrong: low (adapter is isolated and optional).

## ADR-018 CodeMirror 6 as the editor — accepted in Phase 1
Context: Monaco is heavy and weak on mobile; CodeMirror 6 is accessible, small, works on phones. Cost if wrong: low.

## ADR-019 One SVG icon set, no emoji — fixed (Rule 11)
Decision: Solar (Iconify) or Lucide, chosen in Phase 2; `tools/check-emoji.sh` in CI.

## Phase 0 rulings (agent, 2026-10-26) — accepted in Phase 1

Nour was away during Phase 0. Each ruling below takes the plan's proposed default or the cheapest reversible option, and is listed again in `docs/REVIEW_FOR_NOUR.md`.

## ADR-020 .NET SDK 10.0.403 pinned, LangVersion 13 — accepted in Phase 1 (Q2); LangVersion superseded by ADR-036
Context: Q2 proposes .NET 10 LTS; `PLAN.md` Phase 0 task 4 says `LangVersion 13`. Decision: `global.json` pins SDK 10.0.403 with `rollForward: latestFeature`; all projects target `net10.0` with `LangVersion 13`. Installed user-locally at `~/.dotnet` with Microsoft's `dotnet-install.sh`. Cost if wrong: low (one line in `global.json`, one in `Directory.Build.props`; moving to C# 14 is a superset).

## ADR-021 xUnit v3 on Microsoft.Testing.Platform — accepted in Phase 1
Context: the .NET 10 SDK no longer runs Microsoft.Testing.Platform test projects through the old VSTest path, and xUnit v3 4.x is built on it. Decision: `xunit.v3.mtp-v2`, opted in through `global.json` (`"test": {"runner": "Microsoft.Testing.Platform"}`). One project runs with `dotnet test --project tests/<Name>` (the bare-path form in older docs no longer works); `dotnet test` at the root runs all. Shouldly for assertions (ADR-008). Cost if wrong: low.

## ADR-022 MongoDB image is config, pinned to mongo:8.2 locally — accepted in Phase 1
Context: `mongo:8` (8.3.x) and `mongo:8.0.34` exit at startup on Linux kernels 6.19 to 7.0.13 (MongoDB SERVER-121912, TCMalloc and rseq). Docker Desktop on Nour's Mac runs kernel 7.0.12. `mongo:8.2` starts and passes the smoke tests. Decision: compose reads `SENNIN_MONGO_IMAGE` from `.env`; `.env.example` sets `mongo:8.2`. Still MongoDB 8 (ADR-001). Revisit when Docker Desktop ships kernel 7.0.14 or later. Cost if wrong: low (one env value).

## ADR-023 Service Bus emulator runs natively on Apple Silicon — accepted in Phase 1
Context: the plan allowed skipping the emulator smoke test on Apple Silicon. Both `servicebus-emulator` and `azure-sql-edge` publish arm64 images, and the round-trip test passes on both queues, so nothing is skipped. Note: Microsoft retired Azure SQL Edge in September 2025; the image still pulls and works. If it stops, swap to `mcr.microsoft.com/mssql/server` (amd64 only, runs under Rosetta). Cost if wrong: low.

## ADR-024 Tooling details chosen in Phase 0 — accepted in Phase 1
- Compose reads the repo-root `.env` through `--env-file .env`; `tools/compose-up.sh` starts the stack and waits until Mongo is primary and the emulator's `/health` is healthy.
- `tools/check-emoji.sh` uses `perl` (macOS grep has no `-P`) with the same code-point ranges, and also scans `tests/`.
- Web lint is ESLint with `typescript-eslint` `strictTypeChecked` (the current Vite template ships oxlint; `CONVENTIONS.md` asks for ESLint). CI uses Node 24 LTS.
- The no-magic-number guard uses a small reflection scanner in `tests/DarbSennin.ArchitectureTests` (NetArchTest cannot read constant values); layering rules use NetArchTest.Rules.
- The web shell is a placeholder with no chosen typeface; fonts and tokens are a Phase 2 decision and nothing ships before then.
- Licence MIT (Q18 proposal); repo path `~/Documents/GitHub/darb-sennin` (Q21 proposal), no remote created.
Cost if wrong: low for each.

## Phase 1 decisions (2026-10-26)

Decided by Claude under Nour's delegation (2026-10-26). Nour said: "the review must be up to u ... i trust ur recommendation ... any choice by u will be approved from my side". Every recommendation in `REVIEW_FOR_NOUR.md` was re-read against `VISION.md`, Nour's rules and what a recruiter sees; five were changed (marked **changed**). The one-page spec is `docs/specs/2026-10-26-phase-01-product-spec.md`. The delegation does not cover outward actions: creating repos, pushing, Azure resources, paid API keys and DNS still need Nour's "yes".

## ADR-025 A session is one evening problem from the weakest tag — accepted (Q1)
Decision: Today offers one problem from the weakest tag; the loop is submit, read the Verdict Sheet, fix one finding, resubmit. About 20 minutes. Cost if wrong: low (recommender ratios are config).

## ADR-026 Reviewer voice is strict, no humour — accepted (Q3)
Decision: plain statements, evidence first, no humour, no exclamation marks; tone rules live in the rubric. Cost if wrong: low (rubric is data).

## ADR-027 Problem families: classic, practical, fintech — accepted, **changed** (Q11)
Decision: as recommended, but the public repo no longer names a single employer. Why changed: README and docs tied the stack to one named employer's intern role; a recruiter from any other company reads that as a project built for someone else. Wording is now "Israeli fintech and enterprise .NET roles". Cost if wrong: low.

## ADR-028 Weekly boss: multi-part, untimed, no penalty — accepted (Q13)
Decision: the boss stays until beaten; losing costs nothing; a losing week is shown honestly. Cost if wrong: low.

## ADR-029 Owner submits; visitors get a read-only demo — accepted, **changed** (Q4)
Decision: GitHub login with an allow-list in config for submitting (as recommended), **plus** a public read-only demo mode on labelled seed data that never reaches the sandbox or the reviewer. Why changed: a single-user app behind a login is invisible to the recruiter the project is built to impress; the read-only demo shows the signature Verdict Sheet with zero sandbox or LLM exposure and zero spend. Cost if wrong: low (one mode flag; the prototype already runs on seed data).

## ADR-030 Pseudo code runs on a labelled Python translation — accepted (Q7)
Decision: as recommended; disputed translations are excluded from progression. Translator model per ADR-033. Cost if wrong: medium (flagged feature, Phase 6).

## ADR-031 v1 languages: Python 3.14, C# 14, Node 24 LTS — accepted, **changed** (Q14)
Decision: three runtimes as recommended, with current versions. Why changed: Python 3.14 is the current stable release and Node 22 is already in maintenance while Node 24 is Active LTS (CI already runs Node 24). Starting a sandbox on runtimes a year from end of life is avoidable churn. TypeScript later. Cost if wrong: low (image tags are config, pinned by digest).

## ADR-032 Streaks: one graded submission a day, two freezes a month, day ends 04:00 Asia/Jerusalem — accepted (Q15)
Decision: as recommended; a missed day never resets rank or points (anti-goal: grind for grind's sake). Cost if wrong: low (config).

## ADR-033 Reviewer: Anthropic Claude API, claude-sonnet-5-5, 5 USD monthly cap — accepted, **changed** (Q6)
Decision: provider as recommended, now with explicit models: `claude-sonnet-5-5` for review and pseudo-code translation, `claude-haiku-5-5` as the configured low-budget fallback, all ids in config. Hard cap 5 USD per month in `config/limits.yaml`; recorded fixtures in CI. Why changed: the earlier answer named no model. Sizing: a review is roughly 6k input and 1.5k output tokens, about 0.03 USD at Sonnet 5.5 rates (2 / 10 USD per million tokens), so 60 reviews a month stay near 2 USD. Phase 7 reads the `claude-api` skill again before writing code (structured output, refusal handling, fallbacks). Enabling a live key still needs Nour's "yes". Cost if wrong: low (model id is config).

## ADR-034 Rank names: Apprentice, Journeyman, Adept, Examiner, Master — accepted (Q16)
Decision: names and thresholds in `config/ranks.yaml`. Severe register, no belts or kyu/dan. Cost if wrong: low.

## ADR-035 Breaking input: full on normal problems, tags and size on bosses — accepted (Q17)
Cost if wrong: low (config per problem).

## ADR-036 .NET 10 LTS with C# 14 — accepted (Q2), supersedes the LangVersion part of ADR-020
Decision: `LangVersion 14` in `Directory.Build.props`; README says C# 14. Build and all tests green after the change. Cost if wrong: low.

## ADR-037 MongoDB.Driver only, no EF Core — accepted, **changed** (Q8)
Decision: all data access through `MongoDB.Driver` 3.x. Why changed: the boss transaction in Phase 8 updates profile, boss and outbox atomically; with EF Core on two aggregates and the driver on the outbox, one transaction would span two data-access stacks and two session models. Two ways to reach the same database is also harder to defend in an interview than one used well. EF Core is not part of the stack listed in `VISION.md` goal 7. Cost if wrong: low to medium (repositories hide the choice).

## ADR-038 Hosting: Atlas M0 on Azure, judge VM with gVisor, Container Apps API — accepted (Q9, Q10)
Decision: as recommended. Nothing is created without Nour's "yes" and a budget alert. Cost if wrong: medium (behind `ISandbox` and repositories).

## ADR-039 Private content repo, Darb Budokai v1 mapping, React 19 + Vite, sennin.zangeel.dev — accepted (Q5, Q12, Q19, Q20)
Decision: as recommended. Creating the content repo and the DNS record are outward actions waiting for Nour. Cost if wrong: low.

## ADR-040 MIT licence; repo b14ckPanther/darb-sennin — accepted (Q18, Q21)
Note: a remote `origin` (`github.com/b14ckPanther/darb-sennin`) already exists locally with `main` and `phase/00-bootstrap` on it. Nothing is pushed by the agent; local `main` is ahead and waits for Nour's "yes" to push.
