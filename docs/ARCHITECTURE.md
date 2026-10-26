# Architecture

Status: the stack (C# 13, ASP.NET Core, MongoDB, Azure, Docker sandboxes, Service Bus, SignalR, xUnit, LLM review with rubric and evidence) comes from Nour's roadmap. Project split, document shapes, Azure service choices, the web client stack and all limits are **proposed, confirm with Nour in Phase 1**.

## 1. Shape in one paragraph

The **web client** (React) sends a submission to the **API** (ASP.NET Core minimal APIs). The API stores it in MongoDB with status `queued` and puts a `JudgeJob` on an **Azure Service Bus** queue. The **Judge** worker (a separate .NET worker service on its own host) takes the job, loads the problem's hidden tests from MongoDB, and runs the code in **one throwaway Docker container per run** under a hardened profile. It compares outputs outside the sandbox, runs the complexity probe (same code at growing input sizes), and posts raw results back on a results queue. The API's **Grader** turns raw results into a deterministic score and evidence list, then asks the **Reviewer** (LLM with a rubric from config) for findings. Every finding must cite evidence ids; the **Evidence Validator** drops anything that does not. The **Progression** module updates the weakness profile, rank, streak and boss state. Progress streams to the browser over **SignalR** as each test resolves.

## 2. Diagram

```
 Browser: sennin-web (React 19 + Vite, CodeMirror 6)
   │  HTTPS /api/*                 ▲ SignalR /hubs/submissions (test-by-test progress)
   ▼                               │
 ┌───────────────────────────────────────────────────────────────┐
 │ DarbSennin.Api  (ASP.NET Core, Azure Container Apps)              │
 │  Endpoints: problems, submissions, profile, boss, admin/content │
 │  Grader ─ Evidence ─ Reviewer client ─ Progression              │
 │  Hosted services: ResultsConsumer, OutboxRelay                  │
 └──────┬──────────────────────┬───────────────────────┬──────────┘
        │ MongoDB.Driver 3.x    │ Service Bus           │ HTTPS (LLM provider,
        ▼                       │ queue: judge-jobs     │  only from the API)
 ┌──────────────┐               ▼                       ▼
 │ MongoDB 8     │       ┌─────────────────────────────────────┐
 │ (Atlas M0 on  │◄──────│ DarbSennin.Judge (worker, Linux VM)    │
 │  Azure or     │ read  │  no DB write, no LLM, no secrets     │
 │  Cosmos vCore)│ tests │  except queue + read-only DB role    │
 └──────────────┘       │  Docker.DotNet → local Docker engine  │
        ▲               └──────┬──────────────────────▲────────┘
        │                      │ one container per run │ stdout/stderr/exit/time
        │                      ▼                      │ (capped, read outside)
        │               ┌──────────────────────────────────────┐
        │               │ Sandbox container (per run)          │
        │               │  --network none  --read-only  seccomp│
        │               │  uid 65534, caps dropped, cgroup     │
        │               │  limits, tmpfs /work, killed on time │
        │               └──────────────────────────────────────┘
        │  queue: judge-results  (Judge → API)
        └───────────── API ResultsConsumer writes results, grades, reviews

 Optional, later: Darb Budokai adapter (outbox → HTTPS + HMAC to Darb Budokai ingest)
```

## 3. Components

| Component | Project | Responsibility |
|---|---|---|
| Web client | `web/sennin-web` | Problem list, editor, live verdict, evidence sheet, profile, boss. Talks only to the API. |
| API | `src/DarbSennin.Api` | Minimal APIs (`MapGroup` per area), auth, rate limiting (`Microsoft.AspNetCore.RateLimiting`), validation, SignalR hub, hosted services. |
| Domain | `src/DarbSennin.Domain` | Pure C#: `Problem`, `Submission`, `Verdict`, `Evidence`, `Finding`, `Score`, `WeaknessProfile`, `Rank`, `Streak`, `Boss`. No I/O. All numbers come from config objects passed in. |
| Infrastructure | `src/DarbSennin.Infrastructure` | Mongo repositories, Service Bus sender/processor, config loaders + JSON Schema validation (`JsonSchema.Net`), LLM HTTP client, outbox. |
| Judge | `src/DarbSennin.Judge` | `BackgroundService` consuming `judge-jobs`. Builds the run plan, calls `DarbSennin.Sandbox`, compares outputs, runs the complexity probe, publishes to `judge-results`. Idempotent by `submissionId + attempt`. |
| Sandbox | `src/DarbSennin.Sandbox` | `ISandbox` with `DockerSandbox` (Docker.DotNet). Creates the container with the validated profile, copies code in via a tar stream, enforces wall-clock with a linked `CancellationToken`, reads capped output, always removes the container. |
| Reviewer | `src/DarbSennin.Reviewer` | Loads rubric, builds the prompt (code as quoted data), calls the LLM with structured output, validates the response schema, runs the Evidence Validator, applies the praise gate, strips emoji. |
| Content CLI | `src/DarbSennin.ContentCli` | `validate` (schema + reference solutions pass all tests + generators deterministic) and `import` (upsert into MongoDB with a content version). |

Why separate Judge from API: the judge needs the Docker socket, which is effectively root on its host. Keeping it on its own VM with no database write access, no LLM key and no user secrets limits the blast radius of a sandbox escape (`SECURITY.md` §3).

## 4. Data flow of one submission

1. `POST /api/submissions {problemId, language, code}`. Size limit and rate limit from config. Stored as `submissions` doc, `status: queued`. Returns `202` with `submissionId`.
2. API sends `JudgeJob {submissionId, problemId, contentVersion, language, attempt}` to `judge-jobs` (code travels in the doc, not the message; Service Bus messages stay small).
3. Judge pulls the job, reads submission + problem tests through a **read-only** MongoDB role, picks the image digest for the language from `config/sandbox/images.yaml`.
4. Compile step (C#) in its own sandbox run with a compile profile; compile errors become evidence of kind `compile_error`.
5. Test step: harness feeds each case's input on stdin, captures stdout per case with a per-run random delimiter. Judge compares with the expected output using the problem's comparator (`exact`, `trimmed`, `float:1e-6`, `unordered-lines`, custom checker in sandbox). Expected outputs never enter the container.
6. Complexity probe: one container run per size `n` from the problem's generator list; the judge measures CPU time from cgroup stats (`cpu.stat usage_usec`), not from anything the program prints. Fit `log(time)` vs `log(n)` with least squares; slope and R² become evidence.
7. Judge publishes `JudgeResult` (per-case pass/fail, actual output truncated, time, memory peak, exit reason, probe points) to `judge-results`. Progress events are also published per case so the UI can animate.
8. API `ResultsConsumer` stores results, runs the **Grader** (deterministic score from `config/grading.yaml`), then the **Reviewer**, then **Progression**. SignalR pushes `caseResolved`, `graded`, `reviewed` to the user's group.
9. Outbox row for `sennin.submission.graded` (consumed by the optional Darb Budokai adapter later).

Pseudo code path: the reviewer translates pseudo code to Python (structured output with a line map), the translation runs through the same sandbox, and the UI labels every result "ran on a translation of your pseudo code" with the translation shown side by side. Evidence tier: `translated`. Proposed, confirm with Nour in Phase 1 (Q7).

## 5. Storage (MongoDB)

Why MongoDB (fixed by roadmap, and it fits): problems are nested documents (statement, samples, tags, limits, per-language starter code); submissions carry variable-shaped results and evidence arrays. Few cross-document joins.

| Collection | Key fields | Indexes |
|---|---|---|
| `problems` | `_id` slug, `contentVersion`, `title`, `statementMd`, `difficulty`, `tags[]`, `limits`, `comparator`, `starters{lang:code}`, `samples[]`, `isBoss`, `demo` | `{tags:1, difficulty:1}`, `{contentVersion:1}` |
| `problem_tests` | `problemId`, `contentVersion`, `caseId`, `input`, `expected`, `tags[]`, `revealOnFail`, `weight` | `{problemId:1, contentVersion:1}` (separate collection so the API's public queries can never project hidden tests by accident) |
| `problem_generators` | `problemId`, `sizes[]`, `seed`, `generatorRef`, `targetComplexity` | `{problemId:1}` |
| `submissions` | `_id`, `userId`, `problemId`, `contentVersion`, `language`, `code`, `status`, `createdAt`, `results`, `score`, `evidence[]`, `findings[]`, `praise?`, `reviewModel`, `rubricVersion` | `{userId:1, createdAt:-1}`, `{userId:1, problemId:1}` |
| `profiles` | `userId`, `rankId`, `points`, `streak{current,best,lastDay,freezesLeft}`, `weakness{tag:{score,lastSeen}}` | `{userId:1}` unique |
| `boss_weeks` | `weekStart`, `problemId`, `userId`, `hp`, `hits[]`, `defeatedAt?` | `{userId:1, weekStart:1}` unique |
| `outbox` | `_id` UUIDv7, `type`, `payload`, `createdAt`, `sentAt?` | `{sentAt:1, createdAt:1}` |
| `processed_messages` | `_id` message id | TTL index 14 days |

Writes that must be atomic (submission graded + profile updated + outbox row) use a MongoDB multi-document transaction (requires a replica set; local compose runs a single-node replica set `--replSet rs0`).

EF Core: the roadmap lists EF Core. Proposed use: the **MongoDB EF Core Provider** (`MongoDB.EntityFrameworkCore`) for the `profiles` and `boss_weeks` aggregates where change tracking helps, raw `MongoDB.Driver` for problems and submissions. Confirm with Nour in Phase 1 (Q8); dropping EF Core is the cheap fallback.

## 6. Config, not code

| Path | Holds |
|---|---|
| `content/<set>/<slug>/problem.yaml` | Metadata, tags, difficulty, limits, comparator, target complexity, boss flag |
| `content/<set>/<slug>/statement.md` | Statement (Markdown, KaTeX allowed) |
| `content/<set>/<slug>/tests/{sample,hidden}/*.yaml` | Cases: input, expected, tags, `revealOnFail`, weight |
| `content/<set>/<slug>/generators/` | Deterministic input generator (Python, runs in the sandbox at import time) and sizes |
| `content/<set>/<slug>/reference/` | Reference solutions per language (validated, never shown) |
| `config/grading.yaml` | Score formula parameters, severity weights, complexity tolerance |
| `config/rubric/v<N>.yaml` | Reviewer rubric: criteria, severities, required evidence kinds, banned phrases, praise gate |
| `config/tags.yaml` | Mistake taxonomy (`off-by-one`, `empty-input`, `overflow`, `quadratic-scan`, `mutation-while-iterating`, ...) with descriptions |
| `config/ranks.yaml` | Rank ids, display names (original), point thresholds |
| `config/progression.yaml` | Weakness decay half-life, recommendation mix, streak rules, freezes, boss schedule |
| `config/sandbox/profiles.yaml` | CPU, memory, pids, wall time, output caps, tmpfs sizes per step and language |
| `config/sandbox/images.yaml` | Language → image digest, compile and run commands |
| `config/limits.yaml` | Submission size, rate limits, LLM token budget per review, daily spend cap |
| `config/copy/en/*.yaml` | Changeable UI copy, verdict labels, empty states |
| `config/schemas/*.json` | JSON Schemas that validate all of the above at startup |

Hidden tests in a public repo are not hidden. `content/demo/` (public) holds 5 to 8 original demo problems whose tests are visible on purpose. The real set lives in a **private content repo** (proposed: `b14ckPanther/darb-sennin-content`, Q5) and is imported into MongoDB with `sennin-content import`. Path from env `SENNIN_CONTENT_PATH`.

## 7. Local development

```bash
cp .env.example .env                      # fill local values only
tools/compose-up.sh                       # docker compose --env-file .env ... up -d, then waits until healthy
#   mongo (image from SENNIN_MONGO_IMAGE, currently mongo:8.2; replica set rs0, :27017)
#   mcr.microsoft.com/azure-messaging/servicebus-emulator (:5672) + mcr.microsoft.com/azure-sql-edge
#   config: deploy/compose/servicebus/Config.json declares judge-jobs, judge-results
docker build -t sennin-sandbox-python:dev sandbox/images/python   # and dotnet, node
dotnet run --project src/DarbSennin.ContentCli -- import content/demo --mode demo
dotnet run --project src/DarbSennin.Api      # :5080
dotnet run --project src/DarbSennin.Judge    # needs /var/run/docker.sock (Docker Desktop on macOS)
npm --prefix web/sennin-web run dev          # :5173
```

`SENNIN_LLM_MODE=fixture` (default locally) serves recorded reviewer responses; `live` needs a key and Nour's approval. On macOS the sandbox runs inside Docker Desktop's Linux VM; seccomp and cgroup v2 behave as on Linux. gVisor is Linux-host only and is tested in CI and on the judge VM.

## 8. Azure (proposed, confirm with Nour in Phase 1; any deploy needs their "yes")

| Piece | Service | Why |
|---|---|---|
| API | Azure Container Apps (Consumption, scale to zero) | Roadmap skill; cheap when idle |
| Web | Azure Static Web Apps (Free) | Free, custom domain `sennin.zangeel.dev` |
| Judge | Azure Linux VM (B2s, Ubuntu 24.04), Docker + gVisor `runsc`, rootless | Container Apps cannot run a Docker engine. Alternative: Azure Container Apps **dynamic sessions** with custom containers (Hyper-V isolated). Q9 |
| Queue | Azure Service Bus (Basic tier: queues only) | Roadmap skill |
| Database | MongoDB Atlas M0 on an Azure region (free) or Azure Cosmos DB for MongoDB vCore (free tier) | Q10 |
| Secrets | Azure Key Vault + managed identities | No connection strings in env on Azure |
| IaC | Bicep in `deploy/azure/`, deployed by `azd` | Reviewable infrastructure |
| CI/CD | GitHub Actions with OIDC federated credentials (no stored Azure secrets) | |
| Cost guard | Azure budget alert at a value Nour sets; Azure for Students credit if eligible | |

## 9. Testing strategy

| Level | Tooling | What |
|---|---|---|
| Domain unit | xUnit v3, Shouldly (FluentAssertions v8 is no longer free for commercial use; avoid) | Score formula, complexity fit, praise gate, evidence validator, weakness decay, rank thresholds, streak rules. Property tests with FsCheck for the fit and decay. |
| Config/content | xUnit + JSON Schema | Every file in `config/` and `content/demo/` validates; reference solutions pass their tests. |
| Integration | Testcontainers (`Testcontainers.MongoDb`, Service Bus emulator via generic container) | Repositories, transactions, outbox, queue round trip, idempotent results consumer. |
| Sandbox | Real Docker on CI | Correct verdicts for OK, WA, TLE, MLE, RE, CE per language. |
| Security corpus | Real Docker on CI, `tests/DarbSennin.Sandbox.SecurityTests/corpus/<lang>/*` with `expect.yaml` | Fork bomb, network egress, DNS, reading `/proc/1/environ`, writing outside tmpfs, disk fill, 1 GB alloc, infinite output, sleep past timeout, orphaned child, `ptrace`, `mount`, `unshare`, `keyctl`, `bpf`, reading host files, forging the delimiter, prompt injection in comments. |
| Reviewer | WireMock.Net + recorded fixtures, Verify (snapshot) for prompts | Prompt shape, schema rejection, evidence validation drops uncited claims, praise gate blocks unearned praise, emoji stripping, injection attempts do not change score. |
| API | `WebApplicationFactory` + Testcontainers | Endpoints, auth, rate limits, hidden tests never in any response (a test scans every endpoint's JSON for case ids). |
| Web | Vitest + Testing Library; Playwright + `@axe-core/playwright` | Components, flows on seed data, a11y, reduced motion, 390 px viewport. |
| Load (hardening) | k6 (local) | 20 concurrent submissions, judge queue depth, no container leaks (`docker ps -a` empty after). |

CI: GitHub Actions on `ubuntu-24.04`: `dotnet format --verify-no-changes`, `dotnet build -warnaserror`, `dotnet test` (with Docker), web lint/test/e2e, `tools/check-emoji.sh`, Trivy scan of sandbox images, and the two attribution checks. No secrets needed in CI.
