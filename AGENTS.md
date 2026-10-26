# AGENTS.md

This repo's full agent manual is **`CLAUDE.md`**. Every agent tool (Codex, Cursor, Copilot, Gemini, Aider, others) must read and follow it. The rules below are a summary; if anything differs, `CLAUDE.md` wins.

## Non-negotiable rules

1. **No AI contributors.** "Never add "Co-Authored-By" or any other AI attribution line to commit messages, pull request descriptions, or any other text, in any project. Commit messages end with the last line of the actual description." Every commit is authored and committed as `Nour Alden Mousa <nmcryptoinvest@gmail.com>` (`git config user.name/user.email` set in the repo). Never write the word "claude" in a commit message.
2. **No hardcoded data.** Problems, hidden tests, ranks, tags, rubric, limits, thresholds and changeable copy live in `content/`, `config/**.yaml`, env vars or MongoDB. Fixtures only in tests and the labelled `demo` seed mode.
3. **Secrets** only in env vars, git-ignored `.env`, or Azure Key Vault; keep `.env.example` current.
4. **Original assets only.** Original or properly licensed art, sound, fonts (Google Fonts OK). Problems are original, never copied from LeetCode or similar. Log third-party assets in `ASSETS.md`.
5. **Ask Nour first** before creating or publicising the GitHub repo, pushing to `main`, merging, publishing, deploying to paid Azure resources, enabling a paid LLM key, or deleting. Commit locally freely. One branch per phase (`phase/NN-name`). Small, honest, working commits.
6. **TDD.** Failing test first, watch it fail, then implement. Testcontainers for MongoDB and Service Bus. Recorded LLM fixtures. No live third-party calls in tests or CI.
7. **UI first.** Design system, then a clickable prototype on seed data, approved screen by screen, before backend work. Responsive, keyboard accessible, `prefers-reduced-motion`, WCAG AA contrast. One modern SVG icon set (Solar or Lucide). **No emoji anywhere.**
8. **Sandbox safety.** User code only ever runs inside the hardened sandbox profile in `docs/SECURITY.md`. Never weaken a sandbox flag without an ADR and Nour's approval.
9. **Skills.** Check the installed skill list before each task and invoke the matching skill first (`CLAUDE.md` section 3).
10. **Workflow:** brainstorm → written spec (`docs/specs/`) → plan (`docs/plans/`) → execute with a ledger (`docs/PROGRESS.md`) → whole-branch review → finish.

## Before every push

```bash
git log --format='%an %ae%n%cn %ce' | sort -u          # only: Nour Alden Mousa nmcryptoinvest@gmail.com
git log --format=%B | grep -ciE 'co-authored|claude|anthropic|generated with'   # must be 0
```

## Resume after a reset

Read `CLAUDE.md`, then `docs/PROGRESS.md`, then `git log --oneline -20`, then the current phase in `docs/PLAN.md`.
