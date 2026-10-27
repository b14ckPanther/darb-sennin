# For Nour

Phases 0, 1 and 2 are done and merged into local `main`. Phase 1 questions and Phase 2 design choices were decided by Claude under your delegation of 2026-10-26; each is recorded in `docs/DECISIONS.md` and `docs/PROGRESS.md`.

## What changed from the earlier recommendations

| # | Earlier | Now | Why |
|---|---|---|---|
| Q4 | Just you, behind a login | You submit; visitors get a read-only demo on seed data | A recruiter cannot see a login-only app. The demo never reaches the sandbox or the model, so it costs nothing. |
| Q6 | Anthropic, no model named | `claude-sonnet-5-5` for review and translation, `claude-haiku-5-5` as low-budget fallback, ids in config | About 0.03 USD a review; the 5 USD cap covers well over 100 reviews. |
| Q8 | EF Core for two aggregates | `MongoDB.Driver` only | The boss transaction spans profile, boss and outbox; one data-access stack keeps it in one session. |
| Q11 | Named one employer | "Israeli fintech and enterprise .NET roles" | Naming one company tells every other recruiter it was built for someone else. |
| Q14 | Python 3.13, Node 22 | Python 3.14, Node 24 LTS | Current releases; Node 22 is already in maintenance. |

Everything else is as recommended. Full list: `docs/OPEN_QUESTIONS.md`.

## Design system (Phase 2)

Direction A, "Examiner's Report", carried on your Ensō brand: ivory paper and forest ink in light, Darb night in dark, Zen Antique, Geist and Geist Mono, Solar icons. Gold only in the mark and earned praise; the vermilion "Earned" stamp appears only when the praise gate passes. Screenshots at 1440 px and 390 px, light and dark: `docs/screenshots/phase-02/`. Run it with `npm --prefix web/sennin-web run dev` and open `?view=verdict`, `?view=verdict-earned`, `?view=today` or `?view=catalogue`. ADR-041 to ADR-044 explain each choice; any of them can still change.

## Only you can do these (outward actions)

1. Push local `main` (and the phase branches) to `origin`. A remote `github.com/b14ckPanther/darb-sennin` already exists; local `main` is ahead of it and nothing has been pushed.
2. Set the GitHub description and topics, and choose public or private.
3. Create the private content repo `b14ckPanther/darb-sennin-content` (Phase 4 needs it for real hidden tests; demo content works without it).
4. Anthropic API key with a 5 USD monthly limit (Phase 7 fixture recording only).
5. Azure resources and budget alert (Phase 10), and the `sennin.zangeel.dev` DNS record.
