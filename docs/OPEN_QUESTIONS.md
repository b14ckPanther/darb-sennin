# Open questions

**All Phase 1 questions are closed** (2026-10-26). Decided by the agent under Nour's delegation (2026-10-26). The answers are in `docs/specs/2026-10-26-phase-01-product-spec.md` and ADR-025 to ADR-040 in `DECISIONS.md`. Numbers are kept because other docs refer to them.

| # | Question | Answer | ADR |
|---|---|---|---|
| Q1 | What does a good 20-minute session look like? | Evening; one problem from the weakest tag; read the verdict; fix one finding. | 025 |
| Q2 | .NET version | .NET 10 LTS, C# 14. | 036 |
| Q3 | How harsh is "never flatters"? | Strict: plain statements, evidence first, no humour. | 026 |
| Q4 | Who uses it? | Owner submits (GitHub allow-list); visitors get a read-only demo on seed data; no leaderboard. **Changed.** | 029 |
| Q5 | Where do hidden tests live? | Private repo `b14ckPanther/darb-sennin-content` (created only with Nour's "yes"). | 039 |
| Q6 | Reviewer provider and spend cap | Anthropic Claude API, `claude-sonnet-5-5` (fallback `claude-haiku-5-5`), 5 USD monthly cap, fixtures in CI. **Changed** (model named). | 033 |
| Q7 | Pseudo code | Translated to Python, run, labelled, translation shown, disputable. | 030 |
| Q8 | EF Core | Not used; `MongoDB.Driver` only. **Changed.** | 037 |
| Q9 | Judge hosting | Small Linux VM, rootless Docker + gVisor, started when needed. | 038 |
| Q10 | MongoDB hosting | Atlas M0 in an Azure region. | 038 |
| Q11 | Which problems? | Classic, practical and a games and sport set (revised by ADR-051); no employer named in the repo. **Changed.** | 027 |
| Q12 | Darb Budokai contract | Map onto `review.completed` v1. | 039 |
| Q13 | Weekly boss | Multi-part, untimed, no penalty, stays until beaten. | 028 |
| Q14 | Languages in v1 | Python 3.14, C# 14, JavaScript on Node 24 LTS. **Changed.** | 031 |
| Q15 | Streak rules | One graded submission a day, two freezes a month, day ends 04:00 Asia/Jerusalem. | 032 |
| Q16 | Rank names | Apprentice, Journeyman, Adept, Examiner, Master (config). | 034 |
| Q17 | Breaking input reveal | Full on normal problems; tags and size on bosses. | 035 |
| Q18 | Licence | MIT. | 040 |
| Q19 | Web client stack | React 19 + Vite + TypeScript. | 039 |
| Q20 | Domain | `sennin.zangeel.dev` (DNS waits for Nour). | 039 |
| Q21 | Repo name and path | `b14ckPanther/darb-sennin`, `~/Documents/GitHub/darb-sennin`. | 040 |

New questions go below this line, one per entry, with the phase that needs the answer.
