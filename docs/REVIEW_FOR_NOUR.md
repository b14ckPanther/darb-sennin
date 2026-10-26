# Review for Nour: Phase 1 answers

Phase 0 is done on branch `phase/00-bootstrap` (not merged, nothing pushed). Phase 1 needs your answers to the questions below before design work starts. Each has my recommendation and one line of why.

Reply **"yes to all"**, or list the numbers you want to change (for example "Q3 very blunt, Q14 add Go").

## Open-ended (your taste; my guesses only)

| # | Question | Recommendation | Why |
|---|---|---|---|
| Q1 | What does a good 20-minute session look like? | Evening: one problem picked from your weakest tag, then read the verdict and fix one finding. | Short, repeatable loop that targets repeated mistakes. |
| Q3 | How harsh is "never flatters"? | Strict: plain statements, evidence first, no humour. | Very blunt reads as noise; neutral drifts toward flattery. |
| Q11 | Which problems? | Classic topics plus practical ones, with a fintech set (money rounding, idempotent payments). | Matches what ChargeAfter-style interviews actually ask. |
| Q13 | What should the weekly boss feel like? | Multi-part, untimed; losing costs nothing, the boss stays until beaten. | Rewards depth over speed; no punishment loop. |

## Product and scope

| # | Question | Recommendation | Why |
|---|---|---|---|
| Q4 | Who uses it? | Just you, GitHub login allow-list in config, no public leaderboard. | Smallest auth and abuse surface. |
| Q7 | Pseudo code | Translate to Python, run it, label "ran on translation" and show the translation. | Keeps pseudo code honest without pretending it ran as written. |
| Q14 | Languages in v1 | Python 3.13, C#, JavaScript (Node 22); TypeScript later. | Three sandbox images is enough for v1. |
| Q15 | Streak rules | One graded submission a day, two freezes a month, day ends 04:00 Asia/Jerusalem. | Late-night sessions still count for the day. |
| Q16 | Rank names | Apprentice, Journeyman, Adept, Examiner, Master (or your own). | Severe register, no martial-arts kitsch. |
| Q17 | Breaking input reveal | Full input for normal problems; tags and size only for bosses. | Learning on normal days, a real test on boss days. |

## Technical

| # | Question | Recommendation | Why |
|---|---|---|---|
| Q2 | .NET version | .NET 10 LTS (already in place) and move to C# 14. | .NET 9 support ends 10 Nov 2026; C# 14 is a superset and a one-line change. |
| Q5 | Where hidden tests live | Private repo `b14ckPanther/darb-sennin-content`. | Free, versioned, same import path as demo content. |
| Q6 | Reviewer LLM and budget | Anthropic API, hard cap 5 USD a month, recorded fixtures in CI. | Strongest at following an evidence-citing rubric; cap keeps it cheap. |
| Q8 | EF Core | MongoDB EF Core Provider for profile and boss, raw driver elsewhere. | Your roadmap names EF Core; limiting it to two aggregates keeps it simple. |
| Q9 | Judge hosting on Azure | One small Linux VM with rootless Docker + gVisor, started only when needed. | Full control of seccomp and matches local Docker exactly. |
| Q10 | MongoDB hosting | MongoDB Atlas M0 on an Azure region. | Real MongoDB 8 (transactions, same driver behaviour as local); free. |
| Q12 | Darb Budokai contract | Map onto `review.completed` v1 (mapping in `INTEGRATION.md` 2.1). | No change to Darb Budokai needed; a v2 can come later if the mapping hurts. |
| Q19 | Web client stack | React 19 + Vite + TypeScript. | Most-listed frontend skill, works best for the SwiftUI-grade phone feel. |
| Q20 | Domain | `sennin.zangeel.dev` | Fits the zangeel.dev portfolio. |

## Process

| # | Question | Recommendation | Why |
|---|---|---|---|
| Q18 | Licence | MIT for code (added as `LICENSE`); content repo private, unlicensed. | Standard for a portfolio repo. |
| Q21 | Repo name and path | `b14ckPanther/darb-sennin`, local `~/Documents/GitHub/darb-sennin` (git initialised here, no remote). | Already in place; creating the GitHub repo still waits for your "yes". |

## Phase 0 rulings to nod through

Details in `docs/DECISIONS.md` ADR-020 to ADR-024. All low cost to change.

- MongoDB runs as `mongo:8.2`: the 8.0.x and 8.3 images refuse to start on Docker Desktop's current kernel.
- Tests run on Microsoft.Testing.Platform, so one project runs with `dotnet test --project <path>`.
- The Service Bus emulator works on your Mac, so no test is skipped.

## Also waiting on you

1. "Yes" to merge `phase/00-bootstrap` into `main` (CLAUDE.md 1.5).
2. "Yes" to create the GitHub repo, when you want it public or private.
3. Your pick of a design direction. `docs/proposals/phase-02-directions.html` shows three proposals; none is approved.
