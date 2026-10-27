# Vision

## 1. Intent

Darb Sennin is a daily practice ground where Nour is told the truth about their code. They write a solution in real code (C#, Python, JavaScript) or in rough pseudo code. The backend runs it in a hardened sandbox against hidden tests, measures how it scales, and a strict reviewer says what is wrong, slow or incomplete. Every statement in a grade points at evidence: the failing test, the input that broke it, the measured complexity, the exact lines. Praise appears only when a deterministic gate says it was earned.

Over weeks it learns which mistakes Nour repeats (off-by-one, empty input, integer overflow, quadratic loops) and serves problems that target them. Ranks, streaks and a weekly boss problem give it a pulse. In Darb Budokai, each graded submission is a boss fight.

## 2. Goals

1. **Evidence on every claim.** No grade, finding or score is shown without a link to a test result, an input, a measurement or a code range.
2. **Honest, unflattering review.** The reviewer never pads with compliments. Praise is gated by data-defined conditions (all tests pass, measured complexity at or below target, no major findings).
3. **Safe execution of untrusted code.** A real, documented, tested sandbox: no network, CPU, memory, pids and wall-clock limits, custom seccomp, read-only root, non-root user, one container per run. A malicious-code corpus proves it in CI.
4. **Targeted practice.** A weakness profile built from tagged failures drives problem recommendations.
5. **Data, not code.** Problems, hidden tests, ranks, rubric and limits live in content and config, editable without a deploy.
6. **Daily use.** Nour actually uses it before interviews: a 20-minute session should feel worth it.
7. **Prove the stack in public.** C#, ASP.NET Core, MongoDB, Azure Service Bus, Azure Container Apps, SignalR, xUnit, with a clean history Nour can walk an interviewer through.

## 3. Non-goals

- Not a public competitive judge with leaderboards for strangers (one owner submits; visitors get a read-only demo on seed data, ADR-029).
- Not a course platform. No videos, no lessons; the statement and the review are the teaching.
- Not a general online IDE. No file trees, no package installs, no debugger.
- Not a LeetCode clone or mirror. Problems are original.
- No support for every language. Three runtimes in v1 (Python 3.14, C# 14, JavaScript on Node 24, ADR-031), plus pseudo code.

## 4. Anti-goals (it would be a failure even if it works)

- **A reviewer that flatters.** "Great job!" on a solution that fails an edge case is a product failure.
- **Claims without evidence.** A finding like "this might be slow" with no measurement behind it.
- **A sandbox that is "probably fine".** Any untested escape path, any secret reachable from a container, any network egress.
- **An LLM that decides the score.** If a comment in the submitted code can raise the grade, the design is broken.
- **Template look.** A stock admin dashboard, gradient blobs, emoji, confetti on every submit, cartoon martial-arts clichés.
- **Hidden tests that leak wholesale.** Revealing one breaking input is the design; dumping the suite is a bug.
- **Grind for grind's sake.** Streaks that punish a missed day so hard that Nour stops opening it.

## 5. Why this stack for the Israeli junior market

- C# and .NET are common in Israeli enterprise and product companies. Israeli enterprise and product .NET roles ask for .NET, MongoDB and Azure; this project is that stack end to end.
- From 431 Israeli listings: Azure 72, MongoDB 65, Microservices 127, Cloud 256, AI 287. Darb Sennin touches all of them with real depth: a queue-backed worker service, a document store with real modelling choices, cloud deployment, and an LLM used with a rubric and evidence instead of as a chatbot.
- Sandboxed execution of untrusted code is a recognised hard backend problem. Being able to explain seccomp, cgroups, namespaces and prompt-injection defences in an interview is rare for a junior.
- It fills the main gap in Nour's GitHub, which is about 90% Next.js, Supabase and TypeScript. This repo shows they can work in a typed, compiled, enterprise backend stack.

## 6. Success looks like

- Nour uses it at least four days a week during the job search.
- The malicious corpus has 30+ cases and every one is contained.
- A recruiter can open the README, watch a 20-second GIF of a grade revealing its evidence, and understand the project.
- An interviewer asks "how do you stop someone from reading your secrets from inside the sandbox?" and Nour answers from their own code.
