import behaviour from '@config/ui/behaviour.json'
import { AnimatePresence, LayoutGroup, m } from 'motion/react'
import { useCallback, useId, useRef, useState, type ReactNode } from 'react'
import { useProblem, useRunSamples, useSubmission, useSubmit } from '../api/queries'
import type { LanguageId, ProblemDetail, SampleRun, Submission } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Loadable } from '../components/Loadable'
import { Segmented } from '../components/Segmented'
import { Sheet } from '../components/Sheet'
import { Tag } from '../components/Tag'
import { ToastRegion } from '../components/Toast'
import { fill, useCopy } from '../copy/copy'
import { spring } from '../design/motion'
import { LazyCodeEditor as CodeEditor } from '../editor/LazyCodeEditor'
import type { CodeEditorHandle, EditorMode } from '../editor/types'
import { cx } from '../lib/cx'
import { defaultLanguage, editorMode, formatMs, languageName, languages } from '../lib/format'
import { Markdown } from '../lib/markdown'
import { useMediaQuery } from '../lib/useMediaQuery'
import { useReduceMotion } from '../lib/motion'
import { Link } from '../lib/Link'
import { DemoBanner } from './chrome'
import { useSearchParam } from '../lib/router'
import { useSettings } from '../lib/settings'
import { useLiveVerdict } from '../verdict/useLiveVerdict'
import { VerdictSheet } from '../verdict/VerdictSheet'

const draftKey = (problemId: string, language: LanguageId) =>
  `sennin.draft.${problemId}.${language}`

/** Drafts stay in this tab (sessionStorage): a lost connection never costs typed code. */
function readDraft(problemId: string, language: LanguageId): string | null {
  try {
    return sessionStorage.getItem(draftKey(problemId, language))
  } catch {
    return null
  }
}

function writeDraft(problemId: string, language: LanguageId, code: string) {
  try {
    sessionStorage.setItem(draftKey(problemId, language), code)
  } catch {
    // Storage blocked: the draft lives in memory for this visit.
  }
}

function Statement({ problem, level = 1 }: { problem: ProblemDetail; level?: 1 | 2 }) {
  const Heading = level === 1 ? 'h1' : 'h2'
  const c = useCopy().workspace
  const headingId = useId()
  return (
    <div className="space-y-7 px-5 py-6 lg:px-8">
      <header>
        {problem.isBoss ? (
          <p className="mb-1 text-footnote font-medium text-ink-muted">{c.boss}</p>
        ) : null}
        <Heading className="font-display text-title-1 tracking-display text-ink">
          {problem.title}
        </Heading>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {problem.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </header>
      <Markdown source={problem.statementMd} />
      <section aria-labelledby={headingId}>
        <h2
          id={headingId}
          className="mb-3 border-t border-line-strong pt-4 text-callout font-semibold text-ink"
        >
          {c.samples}
        </h2>
        <ol className="m-0 list-none space-y-4 p-0">
          {problem.samples.map((sample, i) => (
            <li key={sample.input} className="space-y-2">
              <p className="text-footnote text-ink-muted">{fill(c.sample, { n: i + 1 })}</p>
              <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5">
                <dt className="pt-2 text-footnote text-ink-muted">{c.input}</dt>
                <dd className="m-0">
                  <pre className="overflow-x-auto rounded-control bg-surface-sunk px-3 py-2 text-footnote text-ink">
                    {sample.input}
                  </pre>
                </dd>
                <dt className="pt-2 text-footnote text-ink-muted">{c.output}</dt>
                <dd className="m-0">
                  <pre className="overflow-x-auto rounded-control bg-surface-sunk px-3 py-2 text-footnote text-ink">
                    {sample.output}
                  </pre>
                </dd>
              </dl>
              {sample.note ? <p className="text-footnote text-ink-muted">{sample.note}</p> : null}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="mb-2 border-t border-line-strong pt-4 text-callout font-semibold text-ink">
          {c.constraints}
        </h2>
        <ul className="m-0 list-none space-y-1 p-0 font-mono text-footnote text-ink">
          {problem.constraints.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="num mt-3 text-footnote text-ink-muted">
          {fill(c.limits, {
            time: formatMs(problem.limits.timeMs),
            memory: problem.limits.memoryMb,
          })}
          {'. '}
          {fill(c.hiddenCount, { n: problem.caseCount })}
        </p>
      </section>
    </div>
  )
}

function SampleResults({ runs, problem }: { runs: SampleRun[]; problem: ProblemDetail }) {
  const copy = useCopy()
  const c = copy.workspace
  const passed = runs.filter((r) => r.status === 'pass').length
  return (
    <div className="border-t border-line bg-surface px-4 py-3">
      <p role="status" className="mb-2 text-footnote font-medium text-ink">
        {fill(c.samplesSummary, { passed, total: runs.length })}
      </p>
      <ul className="m-0 list-none space-y-2 p-0">
        {runs.map((r) => {
          const sample = problem.samples[r.sampleIndex]
          return (
            <li key={r.sampleIndex} className="text-footnote">
              <span className="flex items-center gap-2">
                <Icon
                  name={r.status === 'pass' ? 'pass' : 'fail'}
                  filled
                  size={16}
                  className={r.status === 'pass' ? 'text-pass-mark' : 'text-fail-mark'}
                />
                <span className="text-ink">{fill(c.sample, { n: r.sampleIndex + 1 })}</span>
                <span
                  className={r.status === 'pass' ? 'text-pass-ink' : 'font-medium text-fail-ink'}
                >
                  {copy.verdict[r.status]}
                </span>
                <span className="num ml-auto text-ink-muted">{formatMs(r.timeMs)}</span>
              </span>
              {r.status === 'fail' && sample ? (
                <dl className="mt-1 ml-6 grid grid-cols-[6rem_minmax(0,1fr)] gap-x-2 font-mono">
                  <dt className="font-sans text-ink-muted">{copy.screens.verdict.expected}</dt>
                  <dd className="m-0 break-all text-ink">{sample.output}</dd>
                  <dt className="font-sans text-ink-muted">{c.yourOutput}</dt>
                  <dd className="m-0 break-all text-fail-ink">{r.actual}</dd>
                </dl>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LanguagePicker({
  value,
  onChange,
}: {
  value: LanguageId
  onChange: (l: LanguageId) => void
}) {
  const c = useCopy().workspace
  const id = useId()
  const pseudo = value === 'pseudo'
  const [lastReal, setLastReal] = useState<LanguageId>(pseudo ? defaultLanguage : value)
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="sr-only">
        {c.language}
      </label>
      <select
        id={id}
        value={pseudo ? lastReal : value}
        disabled={pseudo}
        onChange={(e) => {
          const next = e.target.value as LanguageId
          setLastReal(next)
          onChange(next)
        }}
        className="min-h-9 rounded-control border border-line-strong bg-surface px-2.5 text-footnote text-ink disabled:opacity-45 pointer-coarse:min-h-touch"
      >
        {languages
          .filter((l) => l !== 'pseudo')
          .map((l) => (
            <option key={l} value={l}>
              {languageName(l)}
            </option>
          ))}
      </select>
      <label className="flex min-h-9 cursor-pointer items-center gap-2 text-footnote text-ink pointer-coarse:min-h-touch">
        <input
          type="checkbox"
          role="switch"
          checked={pseudo}
          onChange={(e) => {
            onChange(e.target.checked ? 'pseudo' : lastReal)
          }}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-10 rounded-full bg-line-strong transition-colors duration-(--duration-micro) peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-raised after:transition-transform after:duration-(--duration-micro) peer-checked:after:translate-x-4"
        />
        {c.pseudo}
      </label>
    </div>
  )
}

function placeholder(
  problem: ProblemDetail,
  language: LanguageId,
  code: string,
  id: string,
): Submission {
  return {
    id,
    problemId: problem.id,
    problemTitle: problem.title,
    language,
    createdAt: new Date().toISOString(),
    verdict: 'failed',
    score: 0,
    maxScore: 0,
    passed: 0,
    total: problem.caseCount,
    tags: [],
    translated: language === 'pseudo',
    praised: false,
    contentVersion: problem.contentVersion,
    code,
    cases: [],
    probe: { skipped: '' },
    findings: [],
    scoreParts: [],
    praise: null,
    translation: null,
    isBoss: problem.isBoss,
  }
}

function WorkspaceBody({
  problem,
  seedCode,
}: {
  problem: ProblemDetail
  seedCode: Submission | undefined
}) {
  const copy = useCopy()
  const c = copy.workspace
  const settings = useSettings()
  const reduce = useReduceMotion()
  const wide = useMediaQuery('(min-width: 64rem)')
  const editor = useRef<CodeEditorHandle>(null)

  const initialLanguage: LanguageId =
    seedCode?.language ?? problem.draft?.language ?? defaultLanguage
  const [language, setLanguage] = useState<LanguageId>(initialLanguage)
  const codeFor = useCallback(
    (lang: LanguageId) =>
      readDraft(problem.id, lang) ??
      (problem.draft?.language === lang ? problem.draft.code : null) ??
      problem.starters[lang],
    [problem],
  )
  // "Try again" opens the old code once, as the draft; from then on the draft is what you typed.
  const [code, setCode] = useState(() => {
    if (seedCode) writeDraft(problem.id, seedCode.language, seedCode.code)
    return codeFor(initialLanguage)
  })
  const [pane, setPane] = useState<'statement' | 'code'>('code')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  // What was sent, so the sheet header does not follow edits made while the run resolves.
  const [sent, setSent] = useState<{ language: LanguageId; code: string } | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [verdictOpen, setVerdictOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const runSamples = useRunSamples()
  const submit = useSubmit()
  const live = useLiveVerdict(submissionId, problem.caseCount)

  const changeLanguage = (next: LanguageId) => {
    writeDraft(problem.id, language, code)
    setLanguage(next)
    setCode(codeFor(next))
  }
  const onChange = (next: string) => {
    setCode(next)
    writeDraft(problem.id, language, next)
  }
  const doRun = () => {
    runSamples.mutate({ problemId: problem.id, language, code })
  }
  const doSubmit = () => {
    if (submit.isPending) return
    const payload = { language, code }
    submit.mutate(
      { problemId: problem.id, ...payload },
      {
        onSuccess: ({ submissionId: id, queued }) => {
          setSent(payload)
          setSubmissionId(id)
          // Desktop: move focus to the sheet so the result is where the reader is.
          requestAnimationFrame(() => {
            document.getElementById('verdict-pane')?.focus({ preventScroll: true })
          })
          setVerdictOpen(true)
          setSheetOpen(true)
          if (queued) setToast(c.queuedToast)
        },
      },
    )
  }

  const firstFail = live.cases.find((x) => x?.status === 'fail')
  const bracket = submissionId && firstFail?.lines ? firstFail.lines : null
  const shown =
    live.submission ??
    (submissionId && sent ? placeholder(problem, sent.language, sent.code, submissionId) : null)

  const highlight = useCallback((range: [number, number] | null) => {
    editor.current?.highlight(range)
  }, [])
  const showLines = (range: [number, number]) => {
    if (!wide) {
      setSheetOpen(false)
      setPane('code')
      // Let the sheet close and the editor mount before scrolling it.
      window.setTimeout(() => editor.current?.reveal(range), 0)
      return
    }
    editor.current?.reveal(range)
  }

  const sheet = shown ? (
    <VerdictSheet
      submission={shown}
      liveCases={live.cases}
      phase={live.phase}
      onHighlightLines={highlight}
      onShowLines={showLines}
      onTryAgain={() => {
        setVerdictOpen(false)
        setSheetOpen(false)
        setPane('code')
        editor.current?.focus()
      }}
      compact={!wide}
    />
  ) : null

  const editorPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-1.5">
        <LanguagePicker value={language} onChange={changeLanguage} />
        <p className="text-caption text-ink-muted max-xl:hidden">
          {settings.keymap === 'vim' ? c.editorHintVim : c.editorHint}
        </p>
      </div>
      {language === 'pseudo' ? (
        <p className="flex items-start gap-2 border-b border-line bg-surface-sunk px-4 py-2 text-footnote text-ink">
          <Icon name="pseudo" size={16} className="mt-px shrink-0 text-ink-muted" />
          {c.pseudoNote}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          ref={editor}
          value={code}
          onChange={onChange}
          mode={editorMode(language) as EditorMode}
          fontSize={settings.editorFontSize}
          vimMode={settings.keymap === 'vim'}
          label={fill(c.editorLabel, { language: languageName(language) })}
          bracket={bracket}
          onSubmit={doSubmit}
          onRunSamples={doRun}
          wrap={!wide}
        />
      </div>
      {runSamples.data ? <SampleResults runs={runSamples.data} problem={problem} /> : null}
    </div>
  )

  const actions: ReactNode = (
    <div className="flex items-center gap-2">
      {submissionId && !wide && !sheetOpen ? (
        <Button
          variant="quiet"
          icon="statement"
          onClick={() => {
            setSheetOpen(true)
          }}
        >
          {c.openVerdict}
        </Button>
      ) : null}
      {submissionId && wide && verdictOpen ? (
        <Button
          variant="quiet"
          icon="chevron-left"
          onClick={() => {
            setVerdictOpen(false)
          }}
        >
          {c.closeVerdict}
        </Button>
      ) : null}
      <Button
        variant="secondary"
        icon="run"
        onClick={doRun}
        disabled={runSamples.isPending}
        aria-keyshortcuts="Control+' Meta+'"
      >
        {runSamples.isPending ? c.running : c.runSamples}
      </Button>
      <Button
        icon="chevron-right"
        onClick={doSubmit}
        disabled={submit.isPending}
        aria-keyshortcuts="Control+Enter Meta+Enter"
      >
        {submit.isPending ? c.submitting : c.submit}
      </Button>
    </div>
  )

  const backLink = (
    <Link
      href={problem.isBoss ? '/boss' : '/library'}
      className="-ml-2 inline-flex min-h-touch shrink-0 items-center gap-0.5 rounded-control pr-2 text-callout text-ink-muted no-underline hover:text-ink"
    >
      <Icon name="chevron-left" size={20} />
      {problem.isBoss ? copy.nav.boss : c.back}
    </Link>
  )

  const transition = reduce ? { duration: 0 } : spring.sheet

  if (wide) {
    const split = verdictOpen && sheet !== null
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
        <div className="flex min-h-12 items-center gap-4 border-b border-line px-6">
          {backLink}
          <p className="truncate text-callout font-medium text-ink">{problem.title}</p>
          <div className="ml-auto">{actions}</div>
        </div>
        <LayoutGroup>
          <div className="flex min-h-0 flex-1 gap-0">
            <AnimatePresence initial={false} mode="popLayout">
              {!split ? (
                <m.section
                  key="statement"
                  aria-label={c.statement}
                  tabIndex={0}
                  layout
                  initial={reduce ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -24 }
                  }
                  transition={transition}
                  className="w-[40%] min-w-0 overflow-y-auto border-r border-line bg-surface"
                >
                  <Statement problem={problem} />
                </m.section>
              ) : null}
            </AnimatePresence>
            <m.section
              layout
              aria-label={c.code}
              transition={transition}
              className={cx(
                'min-w-0 bg-surface transition-opacity duration-(--duration-state)',
                split ? 'w-[45%] opacity-80 focus-within:opacity-100 hover:opacity-100' : 'flex-1',
              )}
            >
              {editorPanel}
            </m.section>
            <AnimatePresence initial={false}>
              {split ? (
                <m.section
                  key="verdict"
                  id="verdict-pane"
                  aria-label={c.verdict}
                  tabIndex={-1}
                  layout
                  initial={reduce ? false : { opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 48 }
                  }
                  transition={transition}
                  className="w-[55%] min-w-0 overflow-y-auto border-l border-line bg-canvas p-6"
                >
                  {sheet}
                </m.section>
              ) : null}
            </AnimatePresence>
          </div>
        </LayoutGroup>
        <ToastRegion
          toast={toast ? { message: toast } : null}
          durationMs={behaviour.toast.durationMs}
          onDismiss={() => {
            setToast(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="material-bar sticky top-0 z-30 border-b border-line pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
        <div className="flex h-12 items-center gap-2 px-4">
          {backLink}
          <h1 className="min-w-0 flex-1 truncate text-center text-callout font-semibold text-ink">
            {problem.title}
          </h1>
          <DemoBanner />
        </div>
        <div className="px-4 pb-2">
          <Segmented
            label={c.pane}
            stretch
            value={pane}
            onChange={setPane}
            options={[
              { value: 'statement', label: c.statement },
              { value: 'code', label: c.code },
            ]}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface">
        {pane === 'statement' ? <Statement problem={problem} level={2} /> : editorPanel}
      </div>
      <div className="material-bar border-t border-line px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <div className="flex justify-end">{actions}</div>
      </div>
      <Sheet
        open={sheetOpen && sheet !== null}
        title={c.verdict}
        detents={behaviour.sheet.detents}
        initialDetent={1}
        onClose={() => {
          setSheetOpen(false)
        }}
      >
        {sheet}
      </Sheet>
      <ToastRegion
        toast={toast ? { message: toast } : null}
        durationMs={behaviour.toast.durationMs}
        onDismiss={() => {
          setToast(null)
        }}
      />
    </div>
  )
}

/** Statement, editor and the live verdict: where a problem is solved (UI_DESIGN.md 2.3). */
export default function Workspace({ problemId }: { problemId: string }) {
  const copy = useCopy()
  const problem = useProblem(problemId)
  const from = useSearchParam('from')
  const seed = useSubmission(from)
  const ready = from === null || seed.data !== undefined || seed.isError
  return (
    <Shell title={problem.data?.title ?? copy.workspace.statement} variant="workspace">
      <Loadable query={problem} what={copy.workspace.loading} shape="split">
        {(data) =>
          ready ? <WorkspaceBody key={from ?? ''} problem={data} seedCode={seed.data} /> : null
        }
      </Loadable>
    </Shell>
  )
}
