# Open questions (only Nour can decide)

The Phase 1 session asks these **one at a time**, open-ended ones first, and records each answer as an ADR in `DECISIONS.md`. Numbers are referenced from other docs; do not renumber.

## Open-ended (ask first)

**Q1. What does a good 20-minute Darb Sennin session look like for you?** When would you open it (morning, before an interview, at night), and what should you walk away with?

**Q3. How harsh is "never flatters"?** Read three sample reviews of the same solution (neutral, strict, very blunt) and say which voice is right. Is any humour allowed, or none?

**Q11. What problems do you want in it?** Classic interview topics only (arrays, graphs, DP), or also practical ones (parse a log, design a rate limiter in code, SQL-like queries over in-memory data)? Should some mirror what ChargeAfter-style fintech interviews ask (money rounding, idempotent payments)?

**Q13. What should the weekly boss feel like?** A harder problem, a multi-part problem, or a timed problem? Should losing it cost anything?

## Product and scope

**Q4. Who uses it?** Just you (single user, GitHub login restricted to `b14ckPanther`), or a few invited friends? Any public leaderboard ever? (Proposed: single user plus an allow-list in config; no public leaderboard.)

**Q7. Pseudo code.** Proposed: the reviewer translates pseudo code into Python, the translation runs in the sandbox, results are labelled "ran on a translation" with the translation shown, and you can dispute it. Alternative: pseudo code is reviewed only, never run, and does not count toward rank. Which?

**Q14. Languages in v1.** Proposed: Python 3.13, C#, JavaScript (Node 22). Add Java, Go, C++ or TypeScript?

**Q15. Streak rules.** Proposed: one graded submission per day keeps the streak; two freezes per month; day boundary at 04:00 Asia/Jerusalem. Change any of these?

**Q16. Rank names.** Proposed: original names in a severe register (for example "Apprentice, Journeyman, Adept, Examiner, Master"), not belts or kyu/dan. Your own names?

**Q17. How much of the breaking input to reveal?** Proposed: full input for normal problems, tags and size only for boss problems. OK?

## Technical

**Q2. .NET version.** The roadmap says C# 13, which is .NET 9. .NET 9's support ends on 10 November 2026 (two weeks from now). Proposed: target **.NET 10 LTS** (supported to November 2028) and keep `LangVersion 13` only if you want the README to say "C# 13"; otherwise use C# 14, which is a superset. Which?

**Q5. Where do the real hidden tests live?** A public repo cannot hold hidden tests. Proposed: a private repo `b14ckPanther/darb-sennin-content` imported with `sennin-content import`; the public repo has only `content/demo/`. Alternative: Azure Blob Storage. Which?

**Q6. Reviewer LLM provider and budget.** Anthropic (Claude via API), Azure OpenAI (fits the Azure story), or a local model through Ollama for zero cost? What monthly spend cap? (Recorded fixtures keep CI free either way.)

**Q8. EF Core.** The skills list names EF Core. Proposed: the MongoDB EF Core Provider for profile and boss aggregates, the raw driver elsewhere. Or drop EF Core and use only the driver (simpler)?

**Q9. Judge hosting on Azure.** Proposed: one small Linux VM (B2s) with rootless Docker + gVisor, which matches "Docker sandboxes" literally and keeps seccomp under our control. Alternative: Azure Container Apps dynamic sessions with custom containers (Hyper-V isolation, managed, but less control over seccomp and harder to run locally). Which, and is a VM that runs only when needed acceptable?

**Q10. MongoDB hosting.** MongoDB Atlas M0 (free) on an Azure region, or Azure Cosmos DB for MongoDB vCore free tier (more "Azure" on the CV, slightly different feature set)?

**Q12. Darb Budokai contract for boss fights.** Darb Budokai's `review.completed` v1 expects a PR (`repo`, `pullRequest`, `commitSha`). Map Sennin submissions onto those fields (proposed mapping in `INTEGRATION.md` §2.1), or add a `review.completed` v2 in Darb Budokai with optional PR fields?

**Q19. Web client stack.** Proposed: React 19 + Vite + TypeScript (React is in 213 Israeli listings; not Next.js, so it adds something). Alternative: Blazor WebAssembly to make the whole project C#. Which?

**Q20. Domain.** `sennin.zangeel.dev`?

## Process

**Q18. Licence.** MIT for the code? (Content repo stays private and unlicensed.)

**Q21. Repo name and local path.** Proposed: `b14ckPanther/darb-sennin`, local `~/Documents/GitHub/darb-sennin`.
