# Phase 3 spec: clickable prototype on seed data

Date: 2026-10-27. Status: approved. Decided by the agent under Nour's delegation (2026-10-26); Nour may revise any screen.

## Goal

Every screen in `UI_DESIGN.md` section 2 works in the browser against labelled demo data, including the full signature sequence, with no backend, no network and no reviewer calls.

## Shape

- **Contract first.** `web/sennin-web/src/api/types.ts` mirrors the planned API DTOs and the hub events (`caseResolved`, `graded`, `reviewed`). Screens call it only through TanStack Query hooks in `src/api/queries.ts`.
- **Demo backend.** `src/api/mock.ts` implements `SenninApi` from `config/seed/demo/*.json` and replays recorded attempts as hub events with judge-like timing (`config/seed/demo/mock.json`). Submitting code replays the recorded attempt whose pattern matches; fixed code earns the clean attempt and its praise. Phase 9 swaps in the HTTP client and SignalR in `src/api/context.tsx`; screens do not change.
- **Seed.** Twelve original problems in three families (classic, practical, games and sport), forty graded submissions with evidence, findings and scores, a weakness profile, a boss week and its record, the rank ladder, and an admin readout. All labelled demo data, shown under the "Demo data" banner.
- **Demo grading (prototype only).** Tests 70 points pro rata, complexity 20 when the measured exponent is within 0.15 of the target, review 10 minus severity weights (critical 6, major 3, minor 1, nit 0). Praise only when every case passes, complexity is full and findings are nits. Phase 6 replaces this with `config/grading.yaml`; the seed holds the computed results, the client computes nothing.
- **Prototype switches** in Settings drive the empty and error states: judge paused, reviewer unavailable, new account, server unreachable.

## Screens

Workspace with live Verdict Sheet; stored Verdict Sheet (failed and earned); Today; Library; Weakness; Boss (and boss verdicts, inputs hidden); History; Ranks; Settings with admin; Profile (phone tab); pseudo code verdict with line mapping and a dispute flag; not found, offline, new account, judge paused, reviewer unavailable.

## Out of scope

Real API, auth, sandbox, judge, grading in code, reviewer, sound (Phase 8 decides).
