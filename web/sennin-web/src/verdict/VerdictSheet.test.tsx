import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import submissions from '@config/seed/demo/submissions.json'
import type { CaseResult, Submission } from '../api/types'
import { VerdictSheet } from './VerdictSheet'

const all = submissions.submissions as unknown as Submission[]
const first = all[0]
if (!first) throw new Error('seed has submissions')
const sub: Submission = first

function live(resolved: number) {
  const cases: (CaseResult | null)[] = sub.cases.map((c, i) => (i < resolved ? c : null))
  return render(
    <VerdictSheet
      submission={sub}
      liveCases={cases}
      phase="running"
      onHighlightLines={() => undefined}
      onShowLines={() => undefined}
    />,
  )
}

describe('VerdictSheet live region', () => {
  it('stays quiet while cases pass', () => {
    live(2)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('announces the first failure once, and keeps that message while later cases pass', () => {
    const { unmount } = live(4)
    const first = screen.getByRole('status').textContent
    expect(first).toBe('Case 04 failed. 3 passed so far.')
    unmount()
    live(5)
    expect(screen.getByRole('status').textContent).toBe(first)
  })

  it('evidence comes before judgement: no score while cases resolve', () => {
    live(6)
    expect(screen.queryByRole('heading', { name: 'Score' })).toBeNull()
  })

  it('a stored sheet can title itself below the page heading', () => {
    render(
      <VerdictSheet
        submission={sub}
        headingLevel={2}
        onHighlightLines={() => undefined}
        onShowLines={() => undefined}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: sub.problemTitle })).toBeInTheDocument()
  })
})
