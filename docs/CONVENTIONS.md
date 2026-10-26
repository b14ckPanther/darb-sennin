# Conventions

## 1. C# style

- .NET SDK pinned in `global.json`; `Nullable` enabled; `TreatWarningsAsErrors`; `AnalysisLevel latest-recommended`; Central Package Management in `Directory.Packages.props`.
- Formatting by `dotnet format` with `.editorconfig` (4 spaces, file-scoped namespaces, `var` when the type is obvious, braces always).
- Naming: `PascalCase` types and members, `_camelCase` private fields, `camelCase` locals, `I` prefix for interfaces, `Async` suffix on async methods.
- Prefer `record` / `record struct` for immutable data, `sealed` classes by default, primary constructors for DI, collection expressions (`[a, b]`), pattern matching over type checks.
- Every async method takes a `CancellationToken` and passes it on. No `.Result` / `.Wait()`.
- Minimal APIs: one static class per area with `Map<Area>Endpoints(this IEndpointRouteBuilder)`, `TypedResults`, request DTOs validated with a small validator (FluentValidation 11 or manual; decide in Phase 4).
- Logging: `ILogger<T>` with source-generated `LoggerMessage` methods; structured properties; never log code bodies or secrets at `Information`.
- Config: `IOptions<T>` with `ValidateOnStart`; no magic numbers (CLAUDE.md §1.2).
- Errors: `ProblemDetails` for HTTP errors; domain results as `Result<T>`-style records, not exceptions, for expected outcomes (WA, TLE).

## 2. TypeScript / React style

- TypeScript `strict`, no `any` (lint error). ESLint (`typescript-eslint` strict) + Prettier.
- Function components, hooks; server state with TanStack Query; no global store unless needed.
- Styling with Tailwind CSS 4 utilities and design tokens only; no raw hex values in components (lint rule).
- One `<Icon>` component wraps the chosen SVG set; no other icon imports (lint rule). No emoji in source or copy.
- User-facing copy from `config/copy/en/*.yaml` (built into a typed module), not inline strings.

## 3. Project layout

As in `README.md` folder map. Rules:
- `DarbSennin.Domain` has no references to Infrastructure, ASP.NET, Docker or Mongo (arch test).
- Sandbox code lives only in `DarbSennin.Sandbox`; only `DarbSennin.Judge` references it (arch test).
- Tests mirror source: `tests/DarbSennin.<Project>.Tests`, plus `tests/DarbSennin.Sandbox.SecurityTests` and `tests/DarbSennin.IntegrationTests`.

## 4. Testing conventions

- TDD always (CLAUDE.md §1.7). Test names: `Method_Scenario_Expected` in C# (`Grade_AllPassButQuadratic_LosesComplexityPoints`), `it("does X when Y")` in TS.
- Arrange / Act / Assert blocks separated by blank lines; one behaviour per test.
- Table-driven tests with `[Theory]` + `[MemberData]` for grading, ranks and streaks.
- Property tests (FsCheck.Xunit) for numeric code (complexity fit, decay).
- Integration tests use Testcontainers and are tagged `[Trait("Category","Integration")]`; sandbox tests `[Trait("Category","Sandbox")]` (need Docker).
- Snapshot tests (Verify.Xunit) for prompts and JSON contracts; snapshots reviewed in PRs.
- No live third-party calls; LLM fixtures in `tests/fixtures/llm/`.
- Test data lives next to the tests; demo seed lives only in `content/demo` and `config/seed/demo`.

## 5. Commits

- Imperative, plain English, first line under 72 characters, optional body explaining why.
  - Good: `Drop reviewer findings that cite unknown evidence ids`
  - Good: `Add failing test for wall-clock kill of sleeping process`
- No prefixes required. No emoji. **No AI attribution of any kind**, and never the word "claude" (CLAUDE.md §1.1).
- Each commit builds and passes tests (a failing-test-only commit says so in its message).
- Author and committer: `Nour Alden Mousa <nmcryptoinvest@gmail.com>`.

## 6. Branches

- `main`: always green, merged only with Nour's "yes".
- `phase/NN-short-name` per phase (`phase/05-sandbox-judge`).
- Optional sub-branches for a long phase: `phase/05-sandbox-judge--corpus`, merged into the phase branch.

## 7. Pull request template (`.github/pull_request_template.md`)

```markdown
## What

<one paragraph: what this PR changes>

## Why

<the problem it solves; link the phase in docs/PLAN.md>

## How it was tested

- [ ] `dotnet test` green
- [ ] `npm test` / `npm run e2e` green (if web touched)
- [ ] Malicious corpus green (if sandbox/judge touched)
- [ ] axe: zero serious/critical (if UI touched)
- [ ] `tools/check-emoji.sh` passes

## Screens

<screenshots for UI changes, light and dark, 390 px and desktop>

## Checklist

- [ ] No hardcoded rules, limits, ranks or copy
- [ ] No secrets; nothing new passed into sandbox env
- [ ] Docs updated (ARCHITECTURE / SECURITY / INTEGRATION / .env.example)
- [ ] No attribution lines anywhere
```

The PR body ends with the last line of the actual description. No generated-by footer.
