import behaviour from '@config/ui/behaviour.json'
import { useCallback, useState } from 'react'
import { useDisputeTranslation, useSubmission } from '../api/queries'
import type { Submission } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Loadable } from '../components/Loadable'
import { ToastRegion } from '../components/Toast'
import { useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { useReduceMotion } from '../lib/motion'
import { navigate } from '../lib/router'
import { useMediaQuery } from '../lib/useMediaQuery'
import { CodePanel } from '../verdict/CodePanel'
import { VerdictSheet } from '../verdict/VerdictSheet'

function TranslationBanner({
  sub,
  onFlag,
  pending,
}: {
  sub: Submission
  onFlag: () => void
  pending: boolean
}) {
  const c = useCopy().pseudo
  const disputed = sub.translation?.disputed ?? false
  return (
    <div className="mb-6 flex flex-wrap items-start gap-3 border-y border-line-strong py-3">
      <Icon name="pseudo" size={20} className="mt-0.5 shrink-0 text-limit-mark" />
      <p role={disputed ? 'status' : undefined} className="min-w-0 flex-1 text-callout text-ink">
        <span className="font-semibold">{c.tier}. </span>
        {disputed ? c.flagged : c.banner}
      </p>
      {disputed ? null : (
        <Button variant="secondary" icon="flag" onClick={onFlag} disabled={pending}>
          {c.flag}
        </Button>
      )}
    </div>
  )
}

/** Pseudo code and the generated Python side by side; hovering a line lights its partner (2.5). */
function TranslationColumns({ sub, lit }: { sub: Submission; lit: [number, number] | null }) {
  const c = useCopy().pseudo
  const [pseudoLine, setPseudoLine] = useState<number | null>(null)
  const [pythonLine, setPythonLine] = useState<number | null>(null)
  const mapping = sub.translation?.mapping ?? []
  const toPython = (n: number | null) => mapping.find(([p]) => p === n)?.[1] ?? null
  const toPseudo = (n: number | null) => mapping.find(([, py]) => py === n)?.[0] ?? null
  if (!sub.translation) return null
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="min-w-0 rounded-panel border border-line bg-surface-sunk">
        <h2 className="border-b border-line px-4 py-2.5 text-footnote font-medium text-ink-muted">
          {c.yours}
        </h2>
        <CodePanel
          code={sub.code}
          bracket={null}
          lit={lit}
          mapped={pseudoLine ?? toPseudo(pythonLine)}
          label={c.yours}
          onHoverLine={setPseudoLine}
        />
      </section>
      <section className="min-w-0 rounded-panel border border-line bg-surface-sunk">
        <h2 className="border-b border-line px-4 py-2.5 text-footnote font-medium text-ink-muted">
          {c.translation}
        </h2>
        <CodePanel
          code={sub.translation.python}
          bracket={null}
          lit={null}
          mapped={pythonLine ?? toPython(pseudoLine)}
          label={c.translation}
          idPrefix="python-line"
          onHoverLine={setPythonLine}
        />
      </section>
      <p className="text-footnote text-ink-muted md:col-span-2">{c.mappingHint}</p>
    </div>
  )
}

function SubmissionBody({ sub }: { sub: Submission }) {
  const copy = useCopy()
  const c = copy.screens.verdict
  const reduce = useReduceMotion()
  const wide = useMediaQuery('(min-width: 64rem)')
  const [lit, setLit] = useState<[number, number] | null>(null)
  const [codeOpen, setCodeOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const dispute = useDisputeTranslation()
  const firstFail = sub.cases.find((x) => x.status === 'fail')
  const highlight = useCallback((range: [number, number] | null) => {
    setLit(range)
  }, [])

  const showLines = (range: [number, number]) => {
    setCodeOpen(true)
    setLit(range)
    requestAnimationFrame(() => {
      const el = document.getElementById(`code-line-${String(range[0])}`)
      el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
      el?.focus({ preventScroll: true })
    })
  }

  const code = sub.translation ? (
    <TranslationColumns sub={sub} lit={lit} />
  ) : (
    <details
      open={wide || codeOpen}
      onToggle={(event) => {
        setCodeOpen(event.currentTarget.open)
      }}
      className="group rounded-panel border border-line bg-surface-sunk lg:sticky lg:top-20 lg:[&>summary]:hidden"
    >
      <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between px-4 text-callout font-medium text-ink">
        {c.code}
        <Icon
          name="chevron-down"
          size={18}
          className="text-ink-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <CodePanel code={sub.code} bracket={firstFail?.lines ?? null} lit={lit} />
    </details>
  )

  return (
    <div
      className={cx(
        'grid grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-16 md:px-0 lg:gap-10',
        !sub.translation && 'lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]',
      )}
    >
      <div className={cx('min-w-0', sub.translation ? 'order-1' : 'order-2 lg:order-1')}>
        {code}
      </div>
      <div className={cx('min-w-0', sub.translation ? 'order-2 max-w-4xl' : 'order-1 lg:order-2')}>
        <VerdictSheet
          submission={sub}
          onHighlightLines={highlight}
          onShowLines={showLines}
          onTryAgain={() => {
            navigate(`/problems/${sub.problemId}?from=${sub.id}`)
          }}
          banner={
            sub.translation ? (
              <TranslationBanner
                sub={sub}
                pending={dispute.isPending}
                onFlag={() => {
                  dispute.mutate(sub.id, {
                    onSuccess: () => {
                      setToast(copy.pseudo.flaggedToast)
                    },
                  })
                }}
              />
            ) : null
          }
        />
      </div>
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

/** A stored Verdict Sheet, read-only, reached from history, Today or the boss (UI_DESIGN.md 2.4). */
export default function SubmissionPage({ submissionId }: { submissionId: string }) {
  const copy = useCopy()
  const sub = useSubmission(submissionId)
  return (
    <Shell
      title={sub.data?.problemTitle ?? copy.screens.verdict.title}
      back={{ href: '/history', label: copy.screens.verdict.back }}
      quietTitle
    >
      <Loadable query={sub} what={copy.screens.verdict.loading} shape="split">
        {(data) => <SubmissionBody sub={data} />}
      </Loadable>
    </Shell>
  )
}
