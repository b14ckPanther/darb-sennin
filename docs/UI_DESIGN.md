# UI design

Status: the signature ("every grade shows its evidence; praise only when earned"), the weekly boss, ranks and streaks come from the roadmap. Art direction, fonts, icons and motion values were decided in Phase 2 (ADR-041 to ADR-043); screen layouts are approved screen by screen in Phase 3.

Quality bar: "jaw-dropping", never childish or template-looking. Restraint is the point: this is the product that does not flatter you, and the design should feel the same: precise, calm, a little severe.

## 1. Signature moment: the verdict reveals its evidence

You press **Submit** (`Ctrl/Cmd + Enter`).

1. The editor dims slightly and slides left to 45% width. On the right, the **Verdict Sheet** appears as a blank document with a ruled header: problem, language, time, content version.
2. **Test ledger:** one thin row per hidden test, all grey and unlabelled ("case 01" ... "case 24"). As SignalR `caseResolved` events arrive, each row resolves in order: a short ink tick for pass, a hard red rule for fail, amber for time limit. No bouncing, no sound by default. Rows resolve as fast as results come in; nothing waits for animation.
3. **The first failure opens.** The failing row expands into an **evidence card**:
   - the input that broke it (scrollable, monospace, long inputs collapsed with size shown);
   - expected vs actual as an aligned diff with the first differing token marked;
   - the tags of that case ("empty input", "duplicates");
   - "Show in code": the lines the reviewer tied to this failure light up in the editor with a margin bracket.
4. **Complexity plate:** a small log-log plot (from `dataviz` rules): measured points for each `n`, the fitted line, and the target line. Label: "measured ~ n^1.97 (R² 0.99) · target n log n". If the probe was skipped (tests failed), the plate says so and why.
5. **Findings:** each finding is a numbered margin note in the reviewer's voice, severity as a typographic weight (critical in red caps, major bold, minor regular, nit muted), each with evidence chips (`case 07`, `lines 12-18`, `probe n=10^5`). Clicking a chip scrolls and highlights its source.
6. **Score last.** Only after evidence is on screen does the score appear, as a plain number with its breakdown on hover/focus ("tests 60/70 · complexity 0/20 · review -5"). The order is deliberate: evidence, then judgement.
7. **Praise, only if earned.** If the praise gate passes, one restrained line appears under the score in a different weight, for example "Clean. Linear time, every edge case handled." Nothing else changes: no confetti, no glow storm. If the gate does not pass, there is simply no praise line. Its absence is felt.

Reduced motion: rows switch state without transitions, the card appears without expanding, the editor does not slide (the sheet opens as a split immediately).

## 2. Screens and surfaces

### 2.1 Today (home)
- Streak (days, with the current week as seven marks), rank and points to next rank, the weekly boss with HP and days left, and **three recommended problems**, each with the reason in plain words: "You missed empty-input cases 4 times this week."
- One primary action: continue the last open problem, or start the top recommendation.

### 2.2 Problem library
- Filter by tag, difficulty, status (unsolved, failed, solved, solved cleanly). Search by title.
- Rows, not cards: title, tags, difficulty as a three-step mark, your best score, last attempt.
- Phone: native-style list with swipe actions (pin, hide).

### 2.3 Problem workspace
- Left: statement (Markdown, KaTeX), samples with "run samples" (visible tests only, cheap and fast), constraints.
- Right: editor (CodeMirror 6), language picker, "pseudo code" mode toggle that switches the editor to plain text with a label "will be translated and run; translation shown".
- Bottom bar: run samples, submit, timer (optional, off by default).
- Phone: statement and editor become tabs; submit lives in a bottom sheet with detents (peek shows status, full shows the Verdict Sheet).

### 2.4 Verdict Sheet
The signature (section 1). Also reachable later from history, read-only, with "try again" which opens the workspace with this code.

### 2.5 Pseudo code verdict
Two columns: your pseudo code and the generated Python, with line mapping shown as faint connectors on hover. Banner: "These results come from a translation. If the translation is wrong, the grade is wrong: flag it." Flagging marks the submission `translation_disputed` and excludes it from progression.

### 2.6 Weakness profile
- A ranked list of mistake tags with a small sparkline each (decayed score over 8 weeks), the last three submissions that hit it, and "practise this" which starts a targeted problem.
- No radar charts (hard to read). Plain horizontal bars with exact values and AA contrast.

### 2.7 Boss
- The weekly boss problem as a full-bleed page: a title set large, a short original flavour line from `config/copy`, HP shown as a segmented bar where each segment is a hidden test.
- Each submission against the boss shows segments falling away as tests pass (same SignalR events). Defeat writes a single dated line to your record. Losing the week is shown honestly: "Unbeaten. 9 of 24 cases passed."
- Sound: optional, off by default (Phase 8 decides with `build-game-audio-feedback` / `procedural-sfx`): one low struck tone per falling segment, one longer tone on defeat.

### 2.8 History
Submissions by day; filter by problem, verdict, tag. Each opens the read-only Verdict Sheet.

### 2.9 Ranks and record
Rank ladder (names from `config/ranks.yaml`, original), points, best streak, bosses defeated. No public leaderboard in v1.

### 2.10 Settings and content (admin)
Theme (system/light/dark), editor font size, keybindings (default, Vim via `@replit/codemirror-vim`), sound on/off, reduced motion override. Admin: content version in use, import status, rubric version, LLM mode (fixture/live) and spend this month.

### 2.11 Empty, loading and error states
- Judge disabled: "Runs are paused. Your submission is queued and will run when the judge is back."
- Reviewer unavailable: grade and evidence still show; findings area says "Review unavailable: grade is based on tests and measurements only."
- Never a spinner without text. Skeletons follow the real layout.

## 3. Interaction and motion rules

- **Purpose first:** motion shows causality (this test caused this card) or state (queued, running, done). No decorative loops.
- **Springs, not linear.** Motion (formerly Framer Motion) springs: default `stiffness 420, damping 38` for UI, `stiffness 260, damping 30` for sheets (tokens in `web/sennin-web/src/design/motion.ts`).
- Durations for non-spring fades: 120 ms (micro), 200 ms (state), 320 ms (layout). Never longer than 400 ms for anything blocking.
- Pressed state: scale 0.97 with a spring on buttons and rows.
- Evidence linking: hover/focus on any chip highlights its target and draws a hairline connector; `Enter` jumps to it.
- Keyboard first: `Ctrl/Cmd+Enter` submit, `Ctrl/Cmd+'` run samples, `J/K` move through findings, `E` jump to evidence, `G then L` library, `?` shortcut sheet. All rebindable later.
- `prefers-reduced-motion: reduce` disables slides, expansions, connectors' draw animation and HP segment falls (state still changes instantly). User override in settings.

## 4. Art direction

**Chosen: A, "Examiner's Report", carried on the Ensō brand (ADR-041).** Decided by the agent under Nour's delegation (2026-10-26). Light is ivory paper (`#FBF7EC` sheet on `#EFE6D2`) with forest ink; dark is Darb night (`#03110C`) with ivory ink. The sheet is a ruled report: hairline rules, severity by type weight, status as mark plus word plus rule. Gold appears only in the ensō mark and in earned praise; vermilion only in the "Earned" stamp. Type: **Zen Antique** (display, from the brand), **Geist** (interface), **Geist Mono** (code and evidence). Icons: **Solar**, linear for rest and bold duotone for the selected state (ADR-042). Tokens live in `web/sennin-web/src/design/tokens.css`; screenshots in `docs/screenshots/phase-02/`.

Why A over B and C: the Ensō brand is forest, ivory and gold with a brush-serif display, which is A's paper-and-ink register. B's ember and contour texture compete with the gold ensō and lean theatrical; C's near-black signal-green panel discards the brand's light surface and its typeface. A's original fonts (Newsreader, Inter) are replaced by the brand's own faces; Inter is banned by the font rule anyway.

The candidates as first proposed, kept for the record:

All three: one modern SVG icon set (Solar via Iconify, `solar-duotone-bold`, or Lucide), Google Fonts only, no emoji, no gradient blobs, no stock illustration, no martial-arts kitsch (no bamboo, no brush-stroke dragons, no belts).

### A. "Examiner's Report" (chosen)
Warm off-white paper in light mode and deep graphite in dark. The Verdict Sheet looks like an engineering report: ruled lines, margin notes, a single red-ink accent reserved for failures. Type: **Newsreader** (headings), **Inter** (UI), **JetBrains Mono** (code and evidence). Feels rigorous and adult.

### B. "Forge"
Ties to Darb Budokai's night cartographer's table (Darb Budokai's Forge landmark is where Darb Sennin bosses live). Dark ink background, fine contour-line texture at 3% opacity, ember amber for pass, cold steel blue for info, oxide red for failure. Type: **Space Grotesk** (headings), **IBM Plex Sans** (UI), **IBM Plex Mono** (code). Boss page is the most theatrical of the three.

### C. "Instrument"
A measuring-instrument panel: near-black, hairline grids, tabular numerals everywhere, evidence as calibrated readouts; accent a single signal green used only for earned praise. Type: **Geist** or **Inter Tight** (UI), **Geist Mono** (code). Feels like lab equipment.

Phase 2 output: tokens (`color`, `type`, `space`, `radius`, `elevation`, `motion`) as CSS variables + Tailwind 4 `@theme`, light and dark; the three directions were compared side by side in `docs/proposals/phase-02-directions.html`, and the chosen one is comped on the Verdict Sheet, its earned variant and Today.

## 5. Native feel on phones (Rule 11)

- Safe-area insets on all edges; large title on Today, Library and Profile that collapses into the nav bar on scroll.
- Bottom tab bar: Today, Library, Boss, Profile. Workspace hides the tab bar.
- Sheets with detents (peek, half, full) and drag-to-dismiss (proposed library: `vaul`); verdict and filters use sheets.
- Translucent bars (`backdrop-filter: blur(20px) saturate(1.6)`) with a solid fallback when `prefers-reduced-transparency` or no support.
- Native-style grouped lists with swipe actions; 44 pt minimum touch targets; pressed-state scale.

## 6. Accessibility requirements

- WCAG 2.2 AA: text contrast 4.5:1 (body), 3:1 (large text, UI components, chart marks against background). Pass/fail never by colour alone: ticks, rules and words ("pass", "fail", "time limit").
- Everything keyboard reachable with visible focus (2 px outline, offset 2 px, token colour with 3:1 against both backgrounds). The editor's `Tab` key is trapped only while editing; `Esc` then `Tab` leaves it (CodeMirror's documented pattern), stated on screen.
- Screen readers: the test ledger is a live region (`aria-live="polite"`) summarising "case 7 failed, 6 passed so far"; the complexity plot has a text table alternative; evidence chips are links with full labels.
- `prefers-reduced-motion` and `prefers-color-scheme` respected; user overrides in settings.
- Zoom to 200% without loss; layout from 320 px works.
- Playwright + axe on every screen in CI: zero serious/critical violations.
- Copy is plain and direct (`design:ux-copy`, `writing-guidelines`): reviewer findings are full sentences, no jargon without explanation, no exclamation marks.
