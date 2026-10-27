# Phase 3 plan: clickable prototype

Starting from `docs/PLAN.md` Phase 3. Each step: test first, run, commit, log row.

1. Seed under `config/seed/demo` and `api/types.ts`; MockApi and fake stream with tests (forty submissions, filters, evidence references valid, boss inputs hidden, paused judge, reviewer outage, offline, unsubscribe).
2. Router, settings store, motion override, copy per screen, Loadable states; tests for each.
3. Shell (desktop bar, phone large title and tab bar, skip link, shortcut sheet, chords), Today, Library.
4. CodeMirror editor, Workspace, live Verdict Sheet and `useLiveVerdict`; stored Verdict Sheet with code panel.
5. Weakness (`dataviz`), Boss (`create-game-vfx`), History, Ranks, Settings, Profile, pseudo code verdict.
6. Playwright: axe on every screen in both schemes, no sideways scroll, submit flow, chip-to-evidence by keyboard, J/K/E, keyboard-only walk, editor exit (default and Vim), states, reduced motion, 44 pt targets on a touch phone project.
7. Lighthouse on the workspace; performance work.
8. Screenshots 1440 px and 390 px, light and dark; whole-branch review; fixes; docs; merge.
