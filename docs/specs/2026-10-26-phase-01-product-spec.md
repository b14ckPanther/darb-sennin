# Phase 1 product spec

Date: 2026-10-26. Status: **approved**. Decided by the agent under Nour's delegation (2026-10-26): Nour said "the review must be up to u ... any choice by u will be approved from my side". Each answer is recorded as an ADR in `docs/DECISIONS.md` (ADR-025 to ADR-040). Outward actions (creating repos, pushing, Azure resources, paid API keys, DNS) still need Nour's explicit "yes".

## Users

- **Owner:** Nour, signed in with GitHub; only logins on the allow-list in config may submit code (Q4).
- **Visitors:** anyone with the link gets a **read-only demo** on labelled seed data (`SENNIN_MODE=demo`, "Demo data" banner). Visitors can open the library, past Verdict Sheets, the weakness profile and the boss page. They cannot run code, so they never reach the sandbox or the reviewer. This is what a recruiter clicks from the README.
- No public leaderboard, no invited users in v1.

## A session

An evening session of about 20 minutes: open Today, take one problem picked from the weakest tag, submit, read the Verdict Sheet, fix one finding and resubmit (Q1). Streak: one graded submission per day, two freezes per month, the day ends at 04:00 Asia/Jerusalem (Q15). Missing a day never resets rank or points.

## Languages

Python 3.14, C# 14 on .NET 10, JavaScript on Node 24 LTS, plus pseudo code (Q14). Pseudo code is translated to Python by the reviewer model, the translation runs in the same sandbox, every result is labelled "ran on a translation", the translation is shown beside the original, and a disputed translation is excluded from progression (Q7).

## Problems

Original statements and tests only. Three families: classic interview topics (arrays, hashing, graphs, DP), practical tasks (parse a log, rate limiter, queries over in-memory data), and a fintech set (money rounding, idempotent payments, ledgers) (Q11). Hidden tests live in a private content repo `b14ckPanther/darb-sennin-content` (created only with Nour's "yes"); the public repo holds `content/demo/` only (Q5).

## Grading model

1. Tests: hidden cases in the sandbox; comparison in the judge.
2. Complexity: measured log-log slope from cgroup CPU time; skipped and explained when tests fail.
3. Review: deductions from findings, each citing evidence ids; invalid findings dropped.
4. Score is deterministic from config (`config/grading.yaml`); the LLM cannot change it.
5. Praise appears only when the data-defined gate passes.
6. Voice: strict. Plain statements, evidence first, no humour, no exclamation marks (Q3).
7. Breaking input: shown in full on normal problems; on boss problems only the case tags and input size (Q17).

## Progression

Ranks Apprentice, Journeyman, Adept, Examiner, Master, names and thresholds in `config/ranks.yaml` (Q16). Weekly boss: multi-part, untimed, losing costs nothing, the boss stays until beaten (Q13).

## Review provider

Anthropic Claude API. Reviewer model `claude-sonnet-5-5` and pseudo-code translator `claude-sonnet-5-5`, both set in config, not code; `claude-haiku-5-5` is the configured cheaper fallback when the monthly budget runs low. Hard cap 5 USD per month in `config/limits.yaml`, checked before every call. CI never calls a live model; recorded fixtures only (Q6).

## Hosting (all of it waits for Nour's "yes" before anything is created)

- API: Azure Container Apps, consumption plan, scale to zero.
- Judge: one small Linux VM with rootless Docker and gVisor, started only when jobs are queued (Q9).
- Database: MongoDB Atlas M0 in an Azure region (Q10). Data access uses `MongoDB.Driver` only, no EF Core (Q8).
- Web: Azure Static Web Apps at `sennin.zangeel.dev` (Q20).
- Events to Darb Budokai map onto its `review.completed` v1 contract (Q12).

## Fixed earlier, confirmed now

.NET 10 LTS with C# 14 (Q2); React 19, Vite and TypeScript (Q19); MIT licence (Q18); repo `b14ckPanther/darb-sennin` at `~/Documents/GitHub/darb-sennin` (Q21).

## Out of scope for v1

Other languages, invited users, leaderboards, timed contests, videos or lessons, a general-purpose IDE.
