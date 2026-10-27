import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useBackend } from '../api/backend'
import { useSubmission } from '../api/queries'
import type { CaseResult } from '../api/types'
import type { Phase } from './VerdictSheet'

/**
 * Follows one submission over the hub: cases arrive one at a time, then `graded`, then `reviewed`.
 * Grade, evidence and findings are fetched only once the server says they exist.
 */
export function useLiveVerdict(submissionId: string | null, total: number) {
  const { stream } = useBackend()
  const client = useQueryClient()
  const [cases, setCases] = useState<(CaseResult | null)[]>(() => Array<null>(total).fill(null))
  const [phase, setPhase] = useState<Phase>('queued')
  const [tracked, setTracked] = useState(submissionId)
  if (tracked !== submissionId) {
    setTracked(submissionId)
    setCases(Array<null>(total).fill(null))
    setPhase('queued')
  }

  useEffect(() => {
    if (!submissionId) return undefined
    return stream.subscribe(submissionId, {
      caseResolved: ({ index, result }) => {
        setPhase((p) => (p === 'queued' ? 'running' : p))
        setCases((prev) => prev.map((c, i) => (i === index ? result : c)))
      },
      graded: () => {
        setPhase('graded')
        void client.invalidateQueries({ queryKey: ['history'] })
        void client.invalidateQueries({ queryKey: ['problems'] })
      },
      reviewed: () => {
        void client.invalidateQueries({ queryKey: ['submission', submissionId] })
        setPhase('reviewed')
      },
    })
  }, [submissionId, stream, client])

  const graded = phase === 'graded' || phase === 'reviewed'
  const submission = useSubmission(graded ? submissionId : null)
  return { cases, phase, submission: submission.data }
}
