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
