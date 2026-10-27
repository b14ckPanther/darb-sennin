# Darb Sennin

Solve problems in real code or rough pseudo code. A .NET backend runs your code in a hardened Docker sandbox against hidden tests, and a strict reviewer that never flatters says plainly what is wrong, slow or incomplete. It tracks the mistakes you repeat and serves problems that target them, with ranks, streaks and a weekly boss problem.

**Signature:** every grade shows its evidence. The failing test, the input that broke it, the measured complexity. Praise only appears when you have earned it.

Status: Phases 0 to 2 done: .NET 10 solution skeleton, architecture and hygiene checks, local MongoDB + Service Bus emulator stack, React web scaffold and CI, product spec, and a design system on the Ensō brand (tokens with WCAG contrast tests, Solar icons, 14 tested components, Verdict Sheet and Today comps in `docs/screenshots/phase-02/`). Phase 3 done: a clickable prototype of every screen on labelled demo data (workspace with CodeMirror and the live Verdict Sheet, Today, Library, Weakness, Boss, History, Ranks, Settings, the pseudo code verdict and every empty and error state), with Playwright and axe on each screen; screenshots in `docs/screenshots/phase-03/`. Phase 4 (content and config model) is next. No backend features yet.

## Stack

| Layer | Choice | Status |
|---|---|---|
| Language | C# 14 | ADR-036 |
| Runtime | .NET 10 LTS | ADR-013, ADR-036 |
| API | ASP.NET Core minimal APIs + SignalR | fixed by roadmap |
| Database | MongoDB 8 (MongoDB.Driver 3.x) | fixed by roadmap |
| Job queue | Azure Service Bus (local: official Service Bus emulator) | fixed by roadmap |
| Sandbox | Docker, one throwaway container per run: no network, CPU/memory/pids/time limits, custom seccomp, read-only root, non-root user | fixed by roadmap |
| Reviewer | LLM with a rubric that lives in data; every claim must cite evidence | Anthropic Claude API (`claude-sonnet-5-5`, id in config), 5 USD monthly cap (ADR-033) |
| Cloud | Azure: Container Apps (API), a Linux VM for the judge, Static Web Apps (web), Key Vault | decided (ADR-038); nothing created yet |
| Web client | React 19 + Vite + TypeScript + CodeMirror 6 + Tailwind CSS 4 | ADR-014 |
| Tests | xUnit v3, Testcontainers for .NET, WireMock.Net, Vitest, Playwright + axe | ADR-008, ADR-021 |

The stack is what Israeli fintech and enterprise .NET roles ask for: C#, .NET, MongoDB and Azure.

## Run it locally

Needs the .NET 10 SDK, Docker and Node 24.

```bash
cp .env.example .env                      # set SENNIN_SQL_PASSWORD to a strong local value
tools/compose-up.sh                       # MongoDB replica set + Service Bus emulator, waits until healthy
dotnet build -warnaserror && dotnet test  # unit, architecture and compose smoke tests
npm --prefix web/sennin-web ci
npm --prefix web/sennin-web test -- --run # Vitest
npm --prefix web/sennin-web run e2e       # Playwright + axe at desktop and 390 px
tests/tools/run-all.sh                    # commit hook, emoji and attribution checks
```

## Folder map (target, created in Phase 0)

```
darb-sennin/
  CLAUDE.md  AGENTS.md  README.md  .env.example  DarbSennin.sln
  Directory.Build.props  Directory.Packages.props  .editorconfig
  src/
    DarbSennin.Api/            minimal APIs, SignalR hub, auth
    DarbSennin.Domain/         grading, evidence, weakness model, ranks (pure C#)
    DarbSennin.Infrastructure/ Mongo repositories, Service Bus, LLM client, config loaders
    DarbSennin.Judge/          worker: pulls jobs, drives the sandbox, returns raw results
    DarbSennin.Sandbox/        Docker client (Docker.DotNet), sandbox profiles
    DarbSennin.Reviewer/       rubric loading, prompt building, evidence validator
    DarbSennin.ContentCli/     `sennin-content validate|import`
  sandbox/
    images/{python,dotnet,node}/Dockerfile
    seccomp/sennin-seccomp.json
    harness/                 per-language test harnesses
  web/sennin-web/              React client
  config/                    ranks, tags, rubric, limits, copy (YAML)
  content/demo/              original demo problems (public, labelled demo)
  contracts/events/          JSON Schemas for events Darb Sennin emits
  deploy/compose/            local Docker Compose
  deploy/azure/              Bicep templates
  tests/                     xUnit projects + malicious-code corpus
  docs/
```

## How to start

Open the coding agent in this folder and say:

> start Phase 0

The agent reads `CLAUDE.md`, then `docs/PLAN.md` and `docs/PROGRESS.md`, and works phase by phase. Phase 1 asks Nour the questions in `docs/OPEN_QUESTIONS.md` before any design work.

## Documents

| File | What it holds |
|---|---|
| `CLAUDE.md` | Agent operating manual: rules, workflow, skills, commands, definition of done, push checklist |
| `AGENTS.md` | Short pointer for other agent tools |
| `docs/VISION.md` | Intent, goals, non-goals, anti-goals, why this stack |
| `docs/ARCHITECTURE.md` | Components, data flow, storage, config-not-code, local setup, tests |
| `docs/SECURITY.md` | Threat model and sandbox design for untrusted code |
| `docs/UI_DESIGN.md` | Signature moment, screens, motion, art directions, accessibility |
| `docs/INTEGRATION.md` | Events Darb Sennin emits to Darb Budokai (optional, later) |
| `docs/PLAN.md` | Phases 0 to 13 with weights, tasks, tests and skills |
| `docs/PROGRESS.md` | Ledger and rulings |
| `docs/DECISIONS.md` | ADR log |
| `docs/OPEN_QUESTIONS.md` | What only Nour can decide |
| `docs/CONVENTIONS.md` | Code style, layout, tests, commits, branches, PR template |

## Place in the universe

Darb Sennin is the **boss fights** of Darb Budokai, the RPG Nour's real life powers. A graded submission becomes a boss encounter in Darb Budokai: findings give the boss HP, fixing them deals damage, and the weekly boss problem is a named boss. Darb Sennin works fully on its own; the Darb Budokai adapter is an optional, later phase (`docs/INTEGRATION.md`). Darb Kaio can later read Darb Sennin's weak spots to plan Nour's week.
