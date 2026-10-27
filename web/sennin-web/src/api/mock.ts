// Prototype backend: the SenninApi contract served from config/seed/demo. No network, no judge,
// no reviewer, no spend. Screens using it show the Demo data banner (CLAUDE.md 1.2).
import mockConfig from '@config/seed/demo/mock.json'
import problemSeed from '@config/seed/demo/problems.json'
import profileSeed from '@config/seed/demo/profile.json'
import replaySeed from '@config/seed/demo/replay.json'
import submissionSeed from '@config/seed/demo/submissions.json'
import { defaultCopy } from '../copy/copy'
import type {
  AdminView,
  BossWeek,
  HistoryFilter,
  LanguageId,
  ProblemDetail,
  ProblemSummary,
  RanksView,
  SampleRun,
  SenninApi,
  StreamHandlers,
  Submission,
  SubmissionStream,
  SubmissionSummary,
  SystemStatus,
  TodayView,
  WeaknessProfile,
} from './types'

/** Prototype-only switches for the empty and error states (UI_DESIGN.md 2.11). */
export interface DemoState {
  judgePaused: boolean
  reviewerDown: boolean
  newAccount: boolean
  offline: boolean
}

interface ReplayRule {
  pattern: string
  variant: string
}

const clone = <T>(value: T): T => structuredClone(value)

function summarise(s: Submission): SubmissionSummary {
  return {
    id: s.id,
    problemId: s.problemId,
    problemTitle: s.problemTitle,
    language: s.language,
    createdAt: s.createdAt,
    verdict: s.verdict,
    score: s.score,
    maxScore: s.maxScore,
    passed: s.passed,
    total: s.total,
    tags: s.tags,
    translated: s.translated,
    praised: s.praised,
  }
}

/** Removes the review from a recorded attempt, as the API does when the reviewer is down. */
function withoutReview(s: Submission): Submission {
  const parts = s.scoreParts.filter((p) => p.label !== 'Review')
  const score = parts.reduce((sum, p) => sum + p.value, 0)
  const maxScore = parts.reduce((sum, p) => sum + (p.max ?? 0), 0)
  return {
    ...s,
    findings: null,
    scoreParts: parts,
    score,
    maxScore,
    tags: [],
    praise: null,
    praised: false,
  }
}

export interface MockApi extends SenninApi {
  /** Test and stream hook: the recorded result a live submission will resolve to. */
  pending(submissionId: string): Submission | undefined
  /** Stream hook: makes a replayed submission part of history once it is graded. */
  complete(submissionId: string): void
}

export function createMockApi(state: () => DemoState): MockApi {
  const problems = new Map(
    (problemSeed.problems as unknown as ProblemDetail[]).map((p) => [p.id, clone(p)]),
  )
  const submissions = (submissionSeed.submissions as unknown as Submission[]).map(clone)
  const live = new Map<string, Submission>()
  const attempts = replaySeed.attempts as unknown as Record<string, Record<string, Submission>>
  const replay = replaySeed.replay as unknown as Record<
    string,
    { default: string; rules: ReplayRule[]; pseudo?: string }
  >
  let counter = 0

  const respond = <T>(make: () => T, ms = mockConfig.latencyMs): Promise<T> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (state().offline) {
          reject(new Error(defaultCopy.states.offline.body))
          return
        }
        try {
          resolve(make())
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      }, ms)
    })

  const visible = () => (state().newAccount ? [] : submissions)

  const pick = (problemId: string, language: LanguageId, code: string): Submission => {
    const plan = replay[problemId]
    const table = attempts[problemId]
    if (!plan || !table) {
      throw new Error(`No recorded attempt for ${problemId}`)
    }
    const name =
      language === 'pseudo' && plan.pseudo
        ? plan.pseudo
        : (plan.rules.find((r) => new RegExp(r.pattern).test(code))?.variant ?? plan.default)
    const found = table[name]
    if (!found) {
      throw new Error(`Missing attempt ${name} for ${problemId}`)
    }
    return found
  }

  const find = (id: string): Submission => {
    const found = live.get(id) ?? submissions.find((s) => s.id === id)
    if (!found) {
      throw new Error(`Unknown submission ${id}`)
    }
    return found
  }

  const summary = (p: ProblemDetail): ProblemSummary => {
    const mine = visible().filter((s) => s.problemId === p.id)
    const fresh = state().newAccount
    return {
      id: p.id,
      title: p.title,
      family: p.family,
      tags: p.tags,
      difficulty: p.difficulty,
      isBoss: p.isBoss,
      status: fresh ? 'unsolved' : p.status,
      bestScore: fresh ? null : mine.length ? Math.max(...mine.map((s) => s.score)) : p.bestScore,
      lastAttemptAt: fresh ? null : (mine[0]?.createdAt ?? p.lastAttemptAt),
      pinned: p.pinned,
      hidden: p.hidden,
    }
  }

  return {
    today: () =>
      respond(() => {
        const t = clone(profileSeed.today) as unknown as TodayView
        return state().newAccount ? { ...t, continue: null } : t
      }),
    problems: () => respond(() => [...problems.values()].map(summary)),
    problem: (id) =>
      respond(() => {
        const p = problems.get(id)
        if (!p) {
          throw new Error(`Unknown problem ${id}`)
        }
        return { ...clone(p), ...summary(p), draft: state().newAccount ? null : p.draft }
      }),
    setProblemFlags: (id, flags) =>
      respond(() => {
        const p = problems.get(id)
        if (!p) {
          throw new Error(`Unknown problem ${id}`)
        }
        Object.assign(p, flags)
        return summary(p)
      }),
    runSamples: (problemId, language, code) =>
      respond((): SampleRun[] => {
        const p = problems.get(problemId)
        const attempt = pick(problemId, language, code)
        const broken = attempt.cases.flatMap((c) => (c.evidence?.input ? [c.evidence] : []))
        return (p?.samples ?? []).map((sample, i) => {
          const hit = broken.find((e) => e.input === sample.input)
          return {
            sampleIndex: i,
            status: hit ? 'fail' : 'pass',
            actual: hit?.actual ?? sample.output,
            timeMs: Math.round(mockConfig.latencyMs / (4 + i)),
          }
        })
      }, mockConfig.sampleRunMs),
    submit: (problemId, language, code) =>
      respond(() => {
        counter += 1
        const id = `live-${String(counter)}`
        const recorded = pick(problemId, language, code)
        const base: Submission = {
          ...clone(recorded),
          id,
          language,
          code,
          createdAt: new Date().toISOString(),
          findings:
            recorded.findings?.map((f, i) => ({ ...f, id: `${id}-f${String(i + 1)}` })) ?? null,
        }
        live.set(id, state().reviewerDown ? withoutReview(base) : base)
        return { submissionId: id, queued: state().judgePaused }
      }),
    submission: (id) => respond(() => clone(find(id))),
    history: (filter: HistoryFilter = {}) =>
      respond(() =>
        visible()
          .filter((s) => !filter.problemId || s.problemId === filter.problemId)
          .filter((s) => !filter.verdict || s.verdict === filter.verdict)
          .filter((s) => !filter.tag || s.tags.includes(filter.tag))
          .map(summarise),
      ),
    disputeTranslation: (id) =>
      respond(() => {
        const s = find(id)
        if (!s.translation) {
          throw new Error('Only translated submissions can be disputed')
        }
        s.translation.disputed = true
        return clone(s)
      }),
    weakness: () =>
      respond(() => {
        const w: WeaknessProfile = clone(profileSeed.weakness)
        return state().newAccount ? { ...w, tags: [] } : w
      }),
    boss: () => respond(() => clone(profileSeed.boss) as unknown as BossWeek),
    ranks: () => respond((): RanksView => clone(profileSeed.ranks)),
    admin: () => respond(() => clone(profileSeed.admin) as unknown as AdminView),
    status: () =>
      respond((): SystemStatus => ({
        judgeRunning: !state().judgePaused,
        reviewerAvailable: !state().reviewerDown,
      })),
    pending: (id) => live.get(id),
    complete: (id) => {
      const s = live.get(id)
      if (s && !submissions.includes(s)) {
        submissions.unshift(s)
      }
    },
  }
}

/** Replays a recorded attempt as hub events, one case at a time, with judge-like timing. */
export function createMockStream(api: MockApi, state: () => DemoState): SubmissionStream {
  const [fastest, slowest] = mockConfig.stream.caseMs
  return {
    subscribe(submissionId: string, handlers: StreamHandlers) {
      const timers: ReturnType<typeof setTimeout>[] = []
      const target = api.pending(submissionId)
      if (!target || state().judgePaused) {
        return () => undefined
      }
      let at = mockConfig.stream.queuedMs
      target.cases.forEach((result, index) => {
        // Slow cases take longer to come back; a time limit waits the longest.
        const spread =
          (fastest ?? 0) + (((slowest ?? 0) - (fastest ?? 0)) * ((index * 7) % 10)) / 10
        at += result.status === 'limit' ? (slowest ?? 0) * 2 : spread
        timers.push(
          setTimeout(() => {
            handlers.caseResolved?.({ submissionId, index, result })
          }, at),
        )
      })
      at += mockConfig.stream.gradedMs
      timers.push(
        setTimeout(() => {
          api.complete(submissionId)
          handlers.graded?.({ submissionId })
        }, at),
      )
      at += mockConfig.stream.reviewedMs
      timers.push(
        setTimeout(() => {
          handlers.reviewed?.({ submissionId })
        }, at),
      )
      return () => {
        timers.forEach(clearTimeout)
      }
    },
  }
}
