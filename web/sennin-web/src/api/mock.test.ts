import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockApi, createMockStream, type DemoState } from './mock'
import type { CaseResult } from './types'

const calm: DemoState = {
  judgePaused: false,
  reviewerDown: false,
  newAccount: false,
  offline: false,
}

async function settle<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync()
  return promise
}

describe('MockApi on demo seed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('serves twelve problems, one of them the boss', async () => {
    const api = createMockApi(() => calm)
    const problems = await settle(api.problems())
    expect(problems).toHaveLength(12)
    expect(problems.filter((p) => p.isBoss)).toHaveLength(1)
  })

  it('holds forty graded submissions, newest first', async () => {
    const api = createMockApi(() => calm)
    const all = await settle(api.history())
    expect(all).toHaveLength(40)
    const times = all.map((s) => Date.parse(s.createdAt))
    expect([...times].sort((a, b) => b - a)).toEqual(times)
  })

  it('filters history by problem, verdict and tag', async () => {
    const api = createMockApi(() => calm)
    const ledger = await settle(api.history({ problemId: 'ledger-reconciliation' }))
    expect(ledger.every((s) => s.problemId === 'ledger-reconciliation')).toBe(true)
    const accepted = await settle(api.history({ verdict: 'accepted' }))
    expect(accepted.every((s) => s.verdict === 'accepted')).toBe(true)
    const tagged = await settle(api.history({ tag: 'off-by-one' }))
    expect(tagged.length).toBeGreaterThan(0)
    expect(tagged.every((s) => s.tags.includes('off-by-one'))).toBe(true)
  })

  it('every finding cites evidence that exists on its sheet', async () => {
    const api = createMockApi(() => calm)
    for (const summary of await settle(api.history())) {
      const sub = await settle(api.submission(summary.id))
      const lineCount = sub.code.split('\n').length
      for (const f of sub.findings ?? []) {
        expect(f.evidence.length).toBeGreaterThan(0)
        for (const e of f.evidence) {
          if (e.kind === 'case') {
            expect(sub.cases.some((c) => c.caseId === e.target)).toBe(true)
          }
          if (e.kind === 'lines') {
            expect(e.lines?.[1]).toBeLessThanOrEqual(lineCount)
          }
        }
      }
    }
  })

  it('never shows the breaking input of a boss case', async () => {
    const api = createMockApi(() => calm)
    const boss = await settle(api.boss())
    if (!boss.lastSubmissionId) throw new Error('seed has a boss attempt')
    const sub = await settle(api.submission(boss.lastSubmissionId))
    const shown = sub.cases.flatMap((c) => (c.evidence ? [c.evidence] : []))
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.every((e) => e.input === null && e.expected === null)).toBe(true)
  })

  it('pins and hides problems', async () => {
    const api = createMockApi(() => calm)
    const row = await settle(api.setProblemFlags('fewest-coins', { pinned: true, hidden: true }))
    expect(row.pinned && row.hidden).toBe(true)
    const again = (await settle(api.problems())).find((p) => p.id === 'fewest-coins')
    expect(again?.hidden).toBe(true)
  })

  it('a new account has no history and no continue', async () => {
    const api = createMockApi(() => ({ ...calm, newAccount: true }))
    expect(await settle(api.history())).toEqual([])
    expect((await settle(api.today())).continue).toBeNull()
  })

  it('offline rejects every call with a plain message', async () => {
    const api = createMockApi(() => ({ ...calm, offline: true }))
    const call = api.problems()
    const assertion = expect(call).rejects.toThrow(/reach/i)
    await vi.runAllTimersAsync()
    await assertion
  })

  it('runs samples: the flawed ledger attempt fails the first sample', async () => {
    const api = createMockApi(() => calm)
    const runs = await settle(
      api.runSamples('ledger-reconciliation', 'python', 'return missing[:-1]'),
    )
    expect(runs[0]?.status).toBe('fail')
    expect(runs[1]?.status).toBe('pass')
  })

  it('marks a disputed translation and excludes it from progression', async () => {
    const api = createMockApi(() => calm)
    const pseudo = (await settle(api.history())).find((s) => s.translated)
    if (!pseudo) throw new Error('seed has a pseudo code submission')
    const sub = await settle(api.disputeTranslation(pseudo.id))
    expect(sub.translation?.disputed).toBe(true)
  })
})

describe('fake SignalR stream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('replays caseResolved in order, then graded, then reviewed', async () => {
    const api = createMockApi(() => calm)
    const stream = createMockStream(api, () => calm)
    const { submissionId } = await settle(
      api.submit('ledger-reconciliation', 'python', 'for line in statement:\n    pass'),
    )
    const seen: number[] = []
    const order: string[] = []
    stream.subscribe(submissionId, {
      caseResolved: ({ index }) => seen.push(index),
      graded: () => order.push('graded'),
      reviewed: () => order.push('reviewed'),
    })
    await vi.runAllTimersAsync()
    expect(seen).toEqual(Array.from({ length: 12 }, (_, i) => i))
    expect(order).toEqual(['graded', 'reviewed'])
    const sub = await settle(api.submission(submissionId))
    expect(sub.problemId).toBe('ledger-reconciliation')
    expect((await settle(api.history()))[0]?.id).toBe(submissionId)
  })

  it('fixed code replays the clean attempt', async () => {
    const api = createMockApi(() => calm)
    const stream = createMockStream(api, () => calm)
    const code = 'from collections import Counter\ncleared = Counter()'
    const { submissionId } = await settle(api.submit('ledger-reconciliation', 'python', code))
    const results: CaseResult[] = []
    stream.subscribe(submissionId, { caseResolved: ({ result }) => results.push(result) })
    await vi.runAllTimersAsync()
    expect(results.every((r) => r.status === 'pass')).toBe(true)
    expect((await settle(api.submission(submissionId))).code).toBe(code)
  })

  it('a paused judge queues the submission and sends nothing', async () => {
    const paused = { ...calm, judgePaused: true }
    const api = createMockApi(() => paused)
    const stream = createMockStream(api, () => paused)
    const result = await settle(api.submit('fewest-coins', 'python', 'x'))
    expect(result.queued).toBe(true)
    const events = vi.fn()
    stream.subscribe(result.submissionId, { caseResolved: events, graded: events })
    await vi.runAllTimersAsync()
    expect(events).not.toHaveBeenCalled()
  })

  it('a reviewer outage grades without findings', async () => {
    const down = { ...calm, reviewerDown: true }
    const api = createMockApi(() => down)
    const stream = createMockStream(api, () => down)
    const { submissionId } = await settle(api.submit('fewest-coins', 'python', 'greedy'))
    stream.subscribe(submissionId, {})
    await vi.runAllTimersAsync()
    const sub = await settle(api.submission(submissionId))
    expect(sub.findings).toBeNull()
    expect(sub.scoreParts.map((p) => p.label)).not.toContain('Review')
  })

  it('unsubscribing stops further events', async () => {
    const api = createMockApi(() => calm)
    const stream = createMockStream(api, () => calm)
    const { submissionId } = await settle(api.submit('fewest-coins', 'python', 'x'))
    const seen = vi.fn()
    const stop = stream.subscribe(submissionId, { caseResolved: seen })
    await vi.advanceTimersByTimeAsync(700)
    stop()
    const count = seen.mock.calls.length
    await vi.runAllTimersAsync()
    expect(seen.mock.calls.length).toBe(count)
  })
})
