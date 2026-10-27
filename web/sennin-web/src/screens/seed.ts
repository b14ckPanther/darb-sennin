// Demo seed for the component catalogue (config/seed/demo). Screens using it show the Demo data banner.
import profile from '@config/seed/demo/profile.json'
import submissions from '@config/seed/demo/submissions.json'
import type { Submission } from '../api/types'

const all = submissions.submissions as unknown as Submission[]
const failing = all.find(
  (s) => s.findings && s.findings.length > 3 && s.probe.skipped === undefined,
)
const earned = all.find((s) => s.praise !== null)
if (!failing || !earned) {
  throw new Error('Demo seed needs a failing sheet with a probe and an earned one')
}

export const seed = {
  verdict: {
    findings: failing.findings ?? [],
    cases: failing.cases,
    probe: failing.probe,
    score: { value: failing.score, max: failing.maxScore, parts: failing.scoreParts },
    earned: { praise: earned.praise ?? '' },
  },
  today: profile.today,
}
