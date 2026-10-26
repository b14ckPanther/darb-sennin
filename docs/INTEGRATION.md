# Integration with the universe

Darb Sennin must work fully without Darb Budokai. Integration is an optional phase (Phase 11) behind `SENNIN_REALM_ENABLED=false` by default.

Darb Budokai's side of the contract is defined in `/Users/zangeel/Documents/GitHub/darb-budokai/docs/EVENT_CONTRACTS.md` (CloudEvents 1.0 envelope, JSON Schema 2020-12 payloads, `POST /ingest/v1/events` with HMAC). Re-read it at the start of Phase 11; it may have changed.

## 1. Role in Darb Budokai

Fixed by the roadmap: **Darb Sennin reviews are boss fights.** Darb Budokai's game design (`GAME_DESIGN.md` §3) maps `review.completed` to a boss whose HP is the sum of finding weights by severity, and `finding.resolved` to boss damage. Craft XP comes from bosses.

## 2. Events Darb Sennin emits

Schemas live in `contracts/events/<type>/v<N>.schema.json` (JSON Schema 2020-12) with valid and invalid examples in `contracts/events/<type>/examples/`. All are wrapped in Darb Budokai's CloudEvents envelope with `source: urn:budokai:producer:darb-sennin`, `budokaievidence.tier: verified` for executed submissions and `attested` for translated pseudo code (proposed).

### 2.1 `review.completed` v1 (Darb Budokai's existing contract)

Darb Budokai's current schema is PR-shaped (`repo`, `pullRequest`, `commitSha`). Darb Sennin submissions are not PRs. Proposed mapping, **confirm with Nour in Phase 1 (Q12)** because it touches Darb Budokai's contract:

| Darb Budokai field | Darb Sennin value |
|---|---|
| `reviewId` | `submissionId` (UUIDv7) |
| `repo` | `"darb-sennin/<problemSlug>"` |
| `pullRequest` | attempt number for that problem |
| `commitSha` | SHA-256 of the submitted code (first 40 hex chars) |
| `findings[]` | reviewer findings plus one synthetic `major` finding per failed hidden-test tag group; `severity` from rubric; `tags` from `config/tags.yaml`; `resolved: false` |
| `completedAt` | grading time |
| `url` | link to the Verdict Sheet |

Alternative (cleaner): ask Darb Budokai to add a `review.completed` **v2** with an optional `source: "pr" | "sennin"` and nullable PR fields. Darb Sennin would emit v2 once it exists.

### 2.2 `finding.resolved` v1 (Darb Budokai's existing contract)

When a later submission for the same problem no longer triggers a finding (same tag group passes, or the reviewer no longer reports it), emit `{reviewId: <original submissionId>, findingId, resolvedAt, commitSha}`. Matching rule lives in `config/progression.yaml`.

### 2.3 `sennin.submission.graded` v1 (new, Darb Sennin's own)

```json
{
  "submissionId": "0192f...",
  "problemId": "river-crossing",
  "contentVersion": "2026.11.1",
  "language": "csharp|python|javascript|pseudo",
  "testsPassed": 18, "testsTotal": 24,
  "score": 71,
  "measuredComplexity": { "slope": 1.97, "r2": 0.99, "target": "n log n" },
  "weaknessTags": ["empty-input", "quadratic-scan"],
  "isBoss": false,
  "praiseEarned": false,
  "gradedAt": "2026-11-03T21:14:00+02:00"
}
```

Required: `submissionId`, `problemId`, `language`, `testsPassed`, `testsTotal`, `score`, `isBoss`, `praiseEarned`, `gradedAt`. Natural key: `submissionId`. Used by Darb Enmacho (analytics) and Darb Kaio (weak spots). Proposed; Darb Budokai may ignore it until a rule uses it.

### 2.4 `dojo.boss.defeated` v1 (new)

```json
{ "bossWeek": "2026-11-02", "problemId": "string", "submissionId": "string",
  "attempts": 3, "defeatedAt": "date-time" }
```

Natural key: `bossWeek`. Darb Budokai can map it to a named boss and a `boss_<tier>` loot roll.

### 2.5 `dojo.streak.changed` v1 (new, optional)

```json
{ "current": 12, "best": 20, "day": "date", "change": "extended|frozen|broken" }
```

Proposed; low priority.

## 3. Events Darb Sennin consumes

None in v1. Later (proposed): Darb Kaio may call Darb Sennin's API `GET /api/profile/weakness` to plan practice, and `POST /api/recommendations/pin` to pin a problem for a day (asks Nour in the Darb Kaio UI). That is Darb Kaio calling Darb Sennin, not an event.

## 4. Outbound adapter

- `IBudokaiPublisher` in `DarbSennin.Infrastructure` with `NoopBudokaiPublisher` (default) and `HttpBudokaiPublisher`.
- Events are written to the `outbox` collection in the same transaction as the grade (`ARCHITECTURE.md` §5). `OutboxRelay` (hosted service, interval from config) sends pending rows, signs with HMAC-SHA256 (`X-Budokai-Producer`, `X-Budokai-Signature: t=<unix>,v1=<hex>` over `t + "." + rawBody`), retries with exponential backoff (Polly via `Microsoft.Extensions.Http.Resilience`), and marks `sentAt` on 202. 400 moves the row to `outbox_dead` with the error.
- Config: `SENNIN_REALM_ENABLED`, `SENNIN_REALM_INGEST_URL`, `SENNIN_REALM_PRODUCER_KEY_ID`, `SENNIN_REALM_HMAC_SECRET` (secret: env or Key Vault only).
- `budokaimode` is `demo` whenever `SENNIN_MODE=demo`, so demo data never affects a live character.

## 5. Contract tests

- Every example in `contracts/events/**/examples/valid/*.json` validates; every `invalid/*.json` fails (`JsonSchema.Net`).
- Adapter test with WireMock.Net posing as Darb Budokai ingest: signature verified with the same algorithm as Darb Budokai's spec, retries on 503, no retry on 400, idempotent `id`.
- A compatibility test fails the build if a required field is added or a type changes inside the same major version.

## 6. Integration phase (Phase 11, optional)

1. Re-read Darb Budokai's `EVENT_CONTRACTS.md`; settle Q12 with Nour.
2. Write the schemas and examples (TDD: examples first).
3. Outbox + relay + HMAC publisher, behind the flag.
4. Run against Darb Budokai's simulator or a local Darb Budokai ingest if it exists; otherwise WireMock only.
5. Document setup in README.
