import { useCallback, useId, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ComplexityPlot } from '../components/ComplexityPlot'
import { EmptyState } from '../components/EmptyState'
import { EvidenceChip } from '../components/EvidenceChip'
import { FindingNote } from '../components/FindingNote'
import { LargeTitle } from '../components/LargeTitle'
import { ListRow } from '../components/ListRow'
import { PraiseLine } from '../components/PraiseLine'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { Sheet } from '../components/Sheet'
import { TabBar } from '../components/TabBar'
import { Tag } from '../components/Tag'
import { TestRow } from '../components/TestRow'
import { ToastRegion } from '../components/Toast'
import { useCopy } from '../copy/copy'
import { Brand, DemoBanner, ThemeSwitch } from './chrome'
import behaviour from '@config/ui/behaviour.json'
import { seed } from './seed'

function Specimen({ name, children }: { name: string; children: ReactNode }) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-t border-line-strong py-6 md:grid-cols-[12rem_1fr] md:gap-8"
    >
      <h2 id={id} className="font-mono text-callout text-ink-muted">
        {name}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** Every component with its states, on demo data. Used for review, axe and screenshots. */
export function Catalogue() {
  const copy = useCopy()
  const c = copy.screens.catalogue
  const v = seed.verdict
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const [tab, setTab] = useState('today')
  const hideToast = useCallback(() => {
    setToast(false)
  }, [])
  const first = v.findings[0]

  return (
    <div className="min-h-dvh">
      <header className="material-bar sticky top-0 z-30 border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-4 md:px-8">
          <Brand />
          <div className="flex items-center gap-3">
            <DemoBanner />
            <ThemeSwitch />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-4 pt-8 pb-24 md:px-8">
        <h1 className="font-display text-large-title tracking-display text-ink">{c.title}</h1>
        <p className="mt-2 max-w-[60ch] text-callout text-ink-muted">{c.lead}</p>
        <div className="mt-8">
          <Specimen name="Button">
            <div className="flex flex-wrap gap-3">
              <Button icon="run">{copy.screens.verdict.tryAgain}</Button>
              <Button variant="secondary" icon="code">
                {copy.screens.verdict.showInCode}
              </Button>
              <Button variant="quiet">{copy.screens.today.hide}</Button>
              <Button disabled>{copy.screens.today.start}</Button>
            </div>
          </Specimen>
          <Specimen name="Tag">
            <div className="flex flex-wrap gap-1.5">
              <Tag>sorting</Tag>
              <Tag>hashing</Tag>
              <Tag tone="weak">empty input</Tag>
              <Tag tone="weak">off-by-one</Tag>
            </div>
          </Specimen>
          <Specimen name="EvidenceChip">
            <div className="flex flex-wrap gap-1.5">
              <EvidenceChip kind="case" label="case 04" target="case-04" />
              <EvidenceChip kind="lines" label="lines 11-15" target="code-line-11" />
              <EvidenceChip kind="probe" label="probe n=10^5" target="probe" />
            </div>
          </Specimen>
          <Specimen name="TestRow">
            <ol className="m-0 max-w-xl list-none p-0">
              <TestRow id="cat-01" index={1} status="pass" time="12 ms" />
              <TestRow id="cat-02" index={2} status="fail" time="13 ms" />
              <TestRow id="cat-03" index={3} status="limit" time="2.00 s" />
              <TestRow id="cat-04" index={4} status="pending" />
            </ol>
          </Specimen>
          <Specimen name="FindingNote">
            {first ? (
              <FindingNote
                severity="major"
                title={first.title}
                evidence={<EvidenceChip kind="case" label="case 04" target="case-04" />}
              >
                {first.body}
              </FindingNote>
            ) : null}
            <FindingNote severity="minor" title={v.findings[2]?.title ?? ''} />
            <FindingNote severity="nit" title={v.findings[3]?.title ?? ''} />
          </Specimen>
          <Specimen name="ScoreBreakdown">
            <ScoreBreakdown score={v.score.value} max={v.score.max} parts={v.score.parts} />
          </Specimen>
          <Specimen name="PraiseLine">
            <PraiseLine earned text={v.earned.praise} />
          </Specimen>
          <Specimen name="ComplexityPlot">
            <div className="grid gap-6 md:grid-cols-2">
              <ComplexityPlot points={v.probe.points} fit={v.probe.fit} target={v.probe.target} />
              <ComplexityPlot skipped={c.skippedReason} />
            </div>
          </Specimen>
          <Specimen name="ListRow">
            <ul className="m-0 max-w-xl list-none overflow-hidden rounded-panel border border-line p-0">
              {seed.today.recommended.map((p) => (
                <ListRow
                  key={p.title}
                  title={p.title}
                  subtitle={p.reason}
                  onSelect={() => undefined}
                  actions={[
                    {
                      id: 'pin',
                      label: copy.screens.today.pin,
                      icon: 'pin',
                      onAction: () => undefined,
                    },
                    {
                      id: 'hide',
                      label: copy.screens.today.hide,
                      icon: 'hide',
                      onAction: () => undefined,
                    },
                  ]}
                />
              ))}
            </ul>
          </Specimen>
          <Specimen name="LargeTitle">
            <div className="max-w-sm overflow-hidden rounded-panel border border-line bg-canvas">
              <LargeTitle title={copy.screens.today.title} />
            </div>
          </Specimen>
          <Specimen name="TabBar">
            <div className="max-w-sm overflow-hidden rounded-panel border border-line">
              <TabBar
                label={copy.screens.tabs.label}
                activeId={tab}
                onSelect={setTab}
                items={[
                  { id: 'today', label: copy.screens.tabs.today, icon: 'today' },
                  { id: 'library', label: copy.screens.tabs.library, icon: 'library' },
                  { id: 'boss', label: copy.screens.tabs.boss, icon: 'boss' },
                  { id: 'profile', label: copy.screens.tabs.profile, icon: 'profile' },
                ]}
              />
            </div>
          </Specimen>
          <Specimen name="EmptyState">
            <EmptyState
              icon="history"
              title={c.emptyTitle}
              action={<Button variant="secondary">{copy.screens.tabs.library}</Button>}
            >
              {c.emptyBody}
            </EmptyState>
          </Specimen>
          <Specimen name="Sheet and Toast">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSheetOpen(true)
                }}
              >
                {c.openSheet}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setToast(true)
                }}
              >
                {c.showToast}
              </Button>
            </div>
          </Specimen>
        </div>
      </main>
      <Sheet
        open={sheetOpen}
        title={c.sheetTitle}
        detents={behaviour.sheet.detents}
        onClose={() => {
          setSheetOpen(false)
        }}
      >
        <p className="text-callout text-ink-muted">{c.sheetBody}</p>
      </Sheet>
      <ToastRegion
        toast={toast ? { message: c.toastBody } : null}
        durationMs={behaviour.toast.durationMs}
        onDismiss={hideToast}
      />
    </div>
  )
}
