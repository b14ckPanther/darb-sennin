# Master plan: 0% to 100%

Each phase is a shippable increment on its own branch, merged into `main` only with Nour's "yes". Weights sum to 100. Each phase gets a spec in `docs/specs/` and a detailed plan in `docs/plans/` before execution; the task lists below are the starting point, ordered test-first.

| # | Phase | Weight | Cumulative | Branch |
|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 4 | 4 | `phase/00-bootstrap` |
| 1 | Confirm the spec with Nour | 2 | 6 | `phase/01-spec` |
| 2 | Design system | 7 | 13 | `phase/02-design-system` |
| 3 | Clickable prototype on seed data | 12 | 25 | `phase/03-prototype` |
| 4 | Content and config model | 7 | 32 | `phase/04-content-model` |
| 5 | Sandbox and judge | 15 | 47 | `phase/05-sandbox-judge` |
| 6 | Grading and evidence | 10 | 57 | `phase/06-grading-evidence` |
| 7 | The reviewer | 10 | 67 | `phase/07-reviewer` |
| 8 | Progression: weakness, ranks, streaks, boss | 9 | 76 | `phase/08-progression` |
| 9 | Live wiring: API, SignalR, auth | 7 | 83 | `phase/09-live-wiring` |
| 10 | Azure deployment (ask first) | 6 | 89 | `phase/10-azure` |
| 11 | Darb Budokai integration (optional) | 3 | 92 | `phase/11-budokai` |
| 12 | Hardening | 5 | 97 | `phase/12-hardening` |
| 13 | Docs, demo GIF, public launch (ask first) | 3 | 100 | `phase/13-launch` |

---

## Phase 0: Repo bootstrap, CI, conventions (4%)

**Goal:** an empty but real repo where every rule is enforced by tooling from the first commit.

**Skills:** `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`, `run`.

Tasks:
1. `git init` (in the new repo folder Nour chooses, proposed `~/Documents/GitHub/darb-sennin`), copy these docs in, set `git config user.name "Nour Alden Mousa"` and `user.email "nmcryptoinvest@gmail.com"`.
2. `.claude/settings.json` with `"attribution": {"commit": "", "pr": ""}` and `"includeCoAuthoredBy": false`.
3. `.githooks/commit-msg` rejecting `co-authored|claude|anthropic|generated with`; `git config core.hooksPath .githooks`. Test: a script commits a bad message in a temp repo and asserts rejection.
4. `global.json` pinning the .NET SDK (per Q2), `Directory.Build.props` (`Nullable enable`, `TreatWarningsAsErrors`, `AnalysisLevel latest-recommended`, `LangVersion 13`), `Directory.Packages.props` (Central Package Management), `.editorconfig`.
5. Solution skeleton: `DarbSennin.sln`, empty projects from `README.md` folder map, one passing smoke test per test project (`dotnet new xunit3` template).
6. Architecture test (NetArchTest.Rules): Domain references no Infrastructure, no ASP.NET; no numeric literal constants other than 0/1 in Domain and Reviewer. Write it failing against a planted constant, then remove the constant.
7. `tools/check-emoji.sh` + test fixture file with an emoji that it must catch; `tools/check-no-attribution.sh`.
8. `deploy/compose/compose.yml`: `mongo:8` single-node replica set, Service Bus emulator + `azure-sql-edge`, `Config.json` with two queues. Smoke: `docker compose up -d` and a test that connects to both.
9. `web/sennin-web`: `npm create vite@latest sennin-web -- --template react-ts`, ESLint, Prettier, Vitest, Playwright + `@axe-core/playwright`, Tailwind CSS 4.
10. GitHub Actions workflow (`.github/workflows/ci.yml`, runs locally via `act` is optional): format, build, test, web lint/test, emoji check, attribution checks. Not pushed until Nour approves creating the repo.
11. `.env.example`, `.gitignore`, `ASSETS.md` stub, `LICENSE` (proposed MIT, Q18), PR template.

**Tests that prove it:** hook rejects attribution; arch test catches a planted constant; emoji check catches the fixture; compose smoke test connects to Mongo and the Service Bus emulator; `dotnet test` and `npm test` green.

**Done when:** clean clone + `docker compose up -d` + `dotnet test` + `npm test` all green; ledger row written.

---

## Phase 1: Confirm the spec with Nour (2%)

**Goal:** every "proposed" item is accepted, changed or rejected by Nour.

**Skills:** `superpowers:brainstorming`, `writing-guidelines`, `superpowers:verification-before-completion`.

Tasks:
1. Ask the questions in `docs/OPEN_QUESTIONS.md` one at a time, open-ended ones first.
2. Record each answer as an ADR in `docs/DECISIONS.md`; update `ARCHITECTURE.md`, `SECURITY.md`, `UI_DESIGN.md`, `INTEGRATION.md` and this plan where answers change them.
3. Write `docs/specs/YYYY-MM-DD-phase-01-product-spec.md` (one page: users, languages, problem sources, grading model, review provider, hosting) and get Nour's approval.

**Done when:** no unanswered question that blocks Phases 2-5; spec approved and recorded in the ledger.

---

## Phase 2: Design system (7%)

**Goal:** Nour picks an art direction from side-by-side comps, and tokens + core components exist.

**Skills:** `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `design-first-ui-prompting`, `design:design-system`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `audit-reference-originality`, `writing-guidelines`, `solar-duotone-bold`, `animation-systems`, `tailwindcss`, `dataviz`, plus process skills.

Tasks:
1. Comp the Verdict Sheet and Today screen in all three directions from `UI_DESIGN.md` §4 (static, light and dark). Show side by side; Nour picks.
2. Tokens as CSS variables + Tailwind 4 `@theme`: colour (light/dark, contrast pairs verified by a test that computes WCAG ratios from the token file), type scale, spacing, radius, elevation, motion (springs and durations).
3. Icon set chosen (Solar or Lucide) and wrapped in one `<Icon>` component; lint rule forbids importing other icon packages.
4. Components with Vitest + Testing Library tests and a Ladle (or Storybook 8) catalogue: Button (pressed scale), Tag, EvidenceChip, TestRow (pending/pass/fail/tle), FindingNote, ScoreBreakdown, ComplexityPlot, Sheet (detents), TabBar, LargeTitle, ListRow (swipe), EmptyState, Toast.
5. `audit-reference-originality` on the chosen comps.
6. `ASSETS.md` lists fonts and the icon set with licences.

**Tests that prove it:** token contrast test; component tests; axe on the catalogue; reduced-motion snapshot for each animated component.

**Done when:** Nour approved the direction and the component sheet (recorded).

---

## Phase 3: Clickable prototype on seed data (12%)

**Goal:** every screen in `UI_DESIGN.md` §2 works in the browser against realistic seed data, including the full signature sequence, approved by Nour screen by screen. No backend.

**Skills:** `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `ui-implementer`, `web-design-guidelines`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `design:design-handoff`, `animation-systems`, `optimize-web-animations`, `react-view-transitions`, `react-best-practices`, `composition-patterns`, `tailwindcss`, `dataviz`, `playwright-cli`, `create-game-vfx` (boss page only), `solar-duotone-bold`, plus process skills.

Tasks:
1. `config/seed/demo/*.json`: 12 problems (statements written fresh), 40 submissions with realistic verdicts, evidence, findings, a weakness profile, a boss week. Labelled demo.
2. A `MockApi` behind the same TypeScript interface the real client will use (`api/types.ts` mirrors the planned API DTOs), plus a fake SignalR stream that replays `caseResolved` events with realistic timing.
3. Screens in order, each shown to Nour before the next: Workspace → Verdict Sheet (signature) → Today → Library → Weakness → Boss → History → Ranks → Settings → Pseudo code verdict → empty/error states.
4. Phone layouts with tab bar, large titles, sheets, swipe actions; test on a 390 px viewport and a real phone via the Vite LAN URL.
5. Playwright flows: submit and watch the verdict resolve; jump from chip to evidence by keyboard; reduced-motion run.

**Tests that prove it:** Playwright flows per screen; axe zero serious/critical; keyboard-only walkthrough test; Lighthouse performance ≥ 90 on the workspace (local).

**Done when:** each screen approved by Nour (ledger row per screen).

---

## Phase 4: Content and config model (7%)

**Goal:** problems, hidden tests, ranks, rubric and limits live in validated data and load into MongoDB.

**Skills:** `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `simplify`, `code-review`, plus process skills.

Tasks:
1. JSON Schemas in `config/schemas/` for `problem.yaml`, test cases, generators, `grading.yaml`, `rubric`, `tags.yaml`, `ranks.yaml`, `progression.yaml`, `sandbox/profiles.yaml`, `sandbox/images.yaml`, `limits.yaml`. Valid and invalid example per schema; tests first.
2. Typed config records in C# + `IOptions<T>` binding with `ValidateOnStart` and schema validation at startup.
3. `content/demo/` with 6 original problems across tags, each with samples, hidden tests, a generator and a reference solution in Python, C# and JavaScript.
4. `sennin-content validate`: schema check, duplicate case ids, comparator known, generator deterministic for a seed (reference runs come in Phase 5; stubbed with a flag here).
5. `sennin-content import`: upsert `problems`, `problem_tests`, `problem_generators` with `contentVersion`; Testcontainers integration test; re-import is idempotent.
6. Repository layer for problems with a public projection type that has no access to `problem_tests` (compile-time separation).

**Tests that prove it:** schema tests; import idempotence; "public problem DTO contains no hidden data" test; startup fails fast on invalid config.

---

## Phase 5: Sandbox and judge (15%)

**Goal:** code runs safely in a hardened, throwaway container per run; verdicts OK/WA/TLE/MLE/RE/CE/OLE are correct; the malicious corpus is contained.

**Skills:** `security-review`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:subagent-driven-development` (per-language images in parallel), `performance-profiling`, `code-review`, plus process skills.

Tasks:
1. `SandboxProfileValidator` unit tests first (every rule in `SECURITY.md` §4), then the validator.
2. `SandboxProfileBuilder` from `profiles.yaml` to Docker.DotNet `CreateContainerParameters`; tests assert the validator accepts every built profile.
3. Sandbox images (`sandbox/images/*`), harnesses (`sandbox/harness/*`) and `sennin-seccomp.json`. Build script records digests into `config/sandbox/images.yaml`.
4. `DockerSandbox.RunAsync`: create, copy tar, start, bounded output read, wall-clock kill, cgroup stats, always remove. Integration tests per verdict per language.
5. Comparators (`exact`, `trimmed`, `float`, `unordered-lines`, sandboxed custom checker) with unit tests.
6. Judge worker: Service Bus processor (`judge-jobs`), read-only Mongo role, concurrency semaphore, idempotency by `submissionId+attempt`, per-case progress messages, `judge-results`. Testcontainers round trip.
7. Reaper service for expired containers; test that kills the judge mid-run and asserts the reaper cleans up.
8. Malicious corpus (all cases in `SECURITY.md` §5) under `runc`; CI job also under `runsc` (install gVisor on the runner).
9. `sennin-content validate` now runs reference solutions in the sandbox.

**Tests that prove it:** corpus green; verdict matrix green for 3 languages; zero leftover containers after the suite; validator rejects each unsafe profile.

---

## Phase 6: Grading and evidence (10%)

**Goal:** deterministic scores, a measured complexity plate, and an evidence list every later claim must cite.

**Skills:** `superpowers:test-driven-development`, `dataviz`, `simplify`, `code-review`, plus process skills.

Tasks:
1. `Evidence` model with stable ids (`test:<caseId>`, `probe:<n>`, `lines:<a>-<b>`, `compile:<line>`); tests for id parsing and range validation against the source.
2. Complexity probe in the judge (sizes and generator from content), CPU time from cgroup; `ComplexityFit` (least squares on log-log, slope + R²) with FsCheck property tests (synthetic n, n log n, n² data recovers the slope within tolerance from config).
3. `Grader` from `config/grading.yaml`: tests component, complexity component, review deductions placeholder; table-driven tests.
4. Pseudo code path behind a flag (Q7): translation call stubbed with fixtures; results labelled `translated`.
5. API stores results, grade and evidence on the submission.

**Tests that prove it:** fit property tests; grading table tests; evidence ids round-trip; probe skipped correctly when tests fail.

---

## Phase 7: The reviewer (10%)

**Goal:** a strict reviewer whose every finding cites evidence and whose praise is gated by data.

**Skills:** `claude-api` (read first if the provider is Anthropic, Q6), `security-review`, `superpowers:test-driven-development`, `writing-guidelines`, `code-review`, plus process skills.

Tasks:
1. Rubric v1 in `config/rubric/v1.yaml` + response schema `v1.schema.json`: criteria (correctness, edge cases, complexity, clarity, idiomatic use), severities, required evidence kinds per criterion, banned phrases, praise gate, tone rules ("state the problem, show the evidence, say what to change").
2. `PromptBuilder` (code as quoted untrusted data, evidence list, rubric) with Verify snapshot tests.
3. `IReviewModel` with `FixtureReviewModel` (WireMock-served recordings) and the live client. Structured output; schema validation; one retry; `unavailable` fallback.
4. `EvidenceValidator`: drops findings with unknown ids or out-of-range lines; tests with crafted bad findings.
5. `PraiseGate` and banned-phrase and emoji stripping; tests prove praise disappears when the gate fails.
6. Injection suite: three injection styles must not change score or praise.
7. Spend guard: per-review token budget and monthly cap from `limits.yaml`; hard stop test.
8. Record fixtures once with a live key **only after Nour's "yes"** (`SENNIN_LLM_RECORD=1`).

**Tests that prove it:** validator, gate, injection and spend-cap tests; prompt snapshots; no live call in CI (a test fails if the live client is constructed without `SENNIN_LLM_MODE=live`).

---

## Phase 8: Progression: weakness, ranks, streaks, boss (9%)

**Goal:** the dojo learns Nour's repeated mistakes and serves problems that target them, with ranks, streaks and a weekly boss.

**Skills:** `superpowers:test-driven-development`, `dataviz`, `build-game-audio-feedback`, `procedural-sfx`, `create-game-vfx`, `test-playable-web-games`, `code-review`, plus process skills.

Tasks:
1. `WeaknessProfile`: tag scores with exponential decay (half-life from config), updated from failed-case tags and finding tags; FsCheck tests (monotonic decay, bounded).
2. `Recommender`: mix of weakness-targeted, review-of-solved and new problems (ratios from config); deterministic with a seed; table tests.
3. Ranks and points from `ranks.yaml`; streaks with day boundary in Nour's timezone (config), freezes; tests around midnight and DST (Asia/Jerusalem).
4. Boss week: selection rule from `progression.yaml` (scheduled list or weakness-based), HP = hidden cases, hits from passes; transaction updates profile + boss + outbox.
5. Optional boss sound (procedural, original), off by default, respects settings.

**Tests that prove it:** decay and recommender tests; streak DST tests; boss transaction integration test.

---

## Phase 9: Live wiring: API, SignalR, auth (7%)

**Goal:** the approved prototype runs on the real backend end to end.

**Skills:** `react-best-practices`, `ui-implementer`, `playwright-cli`, `security-review`, `run`, `design:accessibility-review`, plus process skills.

Tasks:
1. Minimal API endpoints matching the prototype's `api/types.ts` (contract tests generated from an OpenAPI doc via `Microsoft.AspNetCore.OpenApi`).
2. SignalR hub `/hubs/submissions` with per-user groups; client swaps the fake stream for `@microsoft/signalr`.
3. Auth per Q4 (proposed GitHub OAuth), antiforgery, rate limiting, request limits.
4. Hidden-data scan test over every endpoint.
5. Replace `MockApi` with the real client; prototype Playwright flows now run against compose + API + judge (fixture LLM).

**Tests that prove it:** full e2e submit flow on compose; hidden-data scan; auth and rate-limit tests.

---

## Phase 10: Azure deployment (6%) — ask Nour before any resource is created

**Goal:** Darb Sennin runs on Azure at `sennin.zangeel.dev` (proposed) within a budget Nour sets.

**Skills:** `security-review`, `superpowers:verification-before-completion`, `run`, plus process skills.

Tasks:
1. Bicep for Container Apps environment + API app, Service Bus (Basic, two queues), Key Vault, managed identities, Static Web Apps, judge VM with cloud-init (rootless Docker, gVisor, NSG egress allow-list), Log Analytics; `azd` config. `az bicep build` + `what-if` in CI (no deploy).
2. Budget alert and LLM spend cap set **before** first deploy.
3. GitHub Actions deploy workflow with OIDC federated credentials, manual approval environment.
4. First deploy only after Nour's "yes"; smoke test script; record cost after one week.

**Tests that prove it:** `what-if` clean; smoke test passes against the deployed URL; corpus re-run on the Azure judge VM.

---

## Phase 11: Darb Budokai integration (3%, optional)

**Goal:** graded submissions and bosses reach Darb Budokai as events, without Darb Sennin depending on Darb Budokai.

**Skills:** `superpowers:test-driven-development`, `code-review`, plus process skills.

Tasks: as listed in `docs/INTEGRATION.md` §6.

**Tests that prove it:** contract example tests; adapter tests with WireMock; flag off means zero outbound calls.

---

## Phase 12: Hardening (5%)

**Goal:** it survives load, abuse and a security review.

**Skills:** `security-review`, `performance-profiling`, `design:accessibility-review`, `optimize-web-animations`, `superpowers:systematic-debugging`, `code-review`, plus process skills.

Tasks:
1. k6 load: 20 concurrent submissions; judge queue drains; zero leftover containers; p95 time to first `caseResolved` recorded.
2. Corpus extended to 30+ cases; fuzz the harness protocol with random bytes.
3. Dependency audit (`dotnet list package --vulnerable`, `npm audit`), Trivy on images, CSP and headers check.
4. Full accessibility pass (axe + manual screen reader pass with VoiceOver).
5. Failure drills: judge down, LLM down, Mongo primary step-down; UI states match `UI_DESIGN.md` §2.11.

**Tests that prove it:** load report in `docs/reports/`; all drills green.

---

## Phase 13: Docs, demo GIF, public launch (3%) — ask Nour first

**Goal:** a public repo a recruiter understands in 30 seconds.

**Skills:** `writing-guidelines`, `publish-project-to-github` (only after Nour approves going public), `audit-reference-originality`, `superpowers:finishing-a-development-branch`.

Tasks:
1. README: what, why, 20-second GIF of the Verdict Sheet revealing evidence, architecture diagram, security summary with the corpus table, "AI workflow" section (how Nour reviews AI-written code; no attribution lines), how to run.
2. Final push checks; ask Nour before making the repo public and before any announcement.
3. Darb Kaioken write-up outline (sandbox and honest reviewer) handed to the Darb Kaioken project.

**Done when:** Nour approves and the repo is public.
