// Mirrors the planned API DTOs (docs/ARCHITECTURE.md sections 4 and 5). The prototype's MockApi and
// the Phase 9 HTTP client both implement SenninApi, so screens never know which one they talk to.

export type LanguageId = 'python' | 'csharp' | 'javascript' | 'pseudo'
export type CaseStatus = 'pending' | 'pass' | 'fail' | 'limit'
export type Severity = 'critical' | 'major' | 'minor' | 'nit'
export type EvidenceKind = 'case' | 'lines' | 'probe'
/** Library status filter (UI_DESIGN.md 2.2). */
export type ProblemStatus = 'unsolved' | 'failed' | 'solved' | 'clean'
/** Overall result of one graded submission. */
export type Verdict = 'accepted' | 'failed' | 'limit'
export type ProblemFamily = 'classic' | 'practical' | 'fintech'

export interface ProblemSummary {
  id: string
  title: string
  family: ProblemFamily
  tags: string[]
  difficulty: number
  isBoss: boolean
  status: ProblemStatus
  bestScore: number | null
  /** ISO timestamp of the latest submission, or null. */
  lastAttemptAt: string | null
  pinned: boolean
  hidden: boolean
}

export interface Sample {
  input: string
  output: string
  note?: string
}

export interface ProblemDetail extends ProblemSummary {
  contentVersion: string
  statementMd: string
  constraints: string[]
  samples: Sample[]
  starters: Record<LanguageId, string>
  limits: { timeMs: number; memoryMb: number }
  caseCount: number
  /** Code of the latest attempt per language, so Continue opens where you left off. */
  draft: { language: LanguageId; code: string } | null
}

export interface CaseEvidence {
  /** Null on boss problems: only tags and input size are shown there (ADR-035). */
  input: string | null
  expected: string | null
  actual: string | null
  /** Index of the first differing token in the expected/actual token lists. */
  diffAt: number
  tags: string[]
  /** Human-readable input size, for example "48,000 postings". */
  inputSize?: string
}

export interface CaseResult {
  caseId: string
  status: CaseStatus
  timeMs: number | null
  evidence?: CaseEvidence
  /** Lines the reviewer tied to this failure. */
  lines?: [number, number]
}

export interface ProbePoint {
  n: number
  ms: number
}

export type Probe =
  | {
      skipped?: undefined
      points: ProbePoint[]
      fit: { exponent: number; r2: number }
      target: { label: string; exponent: number }
    }
  | { skipped: string }

export interface EvidenceRef {
  kind: EvidenceKind
  label: string
  /** Element id of the evidence on the Verdict Sheet. */
  target: string
  lines?: [number, number]
}

export interface Finding {
  id: string
  severity: Severity
  title: string
  body: string
  tag: string
  evidence: EvidenceRef[]
}

export interface ScorePart {
  label: string
  value: number
  max?: number
}

export interface Translation {
  python: string
  /** Pairs of [pseudo line, python line], 1-based. */
  mapping: [number, number][]
  disputed: boolean
}

export interface SubmissionSummary {
  id: string
  problemId: string
  problemTitle: string
  language: LanguageId
  createdAt: string
  verdict: Verdict
  score: number
  maxScore: number
  passed: number
  total: number
  tags: string[]
  translated: boolean
  praised: boolean
}

export interface Submission extends SubmissionSummary {
  contentVersion: string
  code: string
  cases: CaseResult[]
  probe: Probe
  /** Null when the reviewer was unavailable: grade and evidence stand on their own. */
  findings: Finding[] | null
  score: number
  scoreParts: ScorePart[]
  praise: string | null
  translation: Translation | null
  isBoss: boolean
}

export type DayState = 'done' | 'frozen' | 'today' | 'ahead' | 'missed'

export interface Recommendation {
  problemId: string
  title: string
  tags: string[]
  difficulty: number
  reason: string
}

export interface TodayView {
  greeting: string
  streak: { days: number; week: DayState[]; weekLabels: string[]; freezesLeft: number }
  rank: { name: string; next: string | null; points: number; nextAt: number | null }
  boss: {
    problemId: string
    title: string
    line: string
    total: number
    remaining: number
    daysLeft: number
  }
  continue: { problemId: string; title: string; detail: string } | null
  recommended: Recommendation[]
  weakTags: string[]
  difficultyMax: number
}

export interface WeaknessHit {
  submissionId: string
  problemTitle: string
  createdAt: string
}

export interface WeaknessTag {
  tag: string
  description: string
  /** Decayed mistake score, 0 to scoreMax. Higher is weaker. */
  score: number
  /** Weekly decayed score, oldest first. */
  trend: number[]
  lastHits: WeaknessHit[]
  practiseProblemId: string
}

export interface WeaknessProfile {
  scoreMax: number
  weeks: number
  tags: WeaknessTag[]
}

export interface BossRecordLine {
  weekOf: string
  text: string
  defeated: boolean
}

export interface BossWeek {
  problemId: string
  title: string
  line: string
  total: number
  /** Case ids passed on the best attempt so far; each is one fallen HP segment. */
  fallen: number
  daysLeft: number
  defeatedAt: string | null
  lastSubmissionId: string | null
  record: BossRecordLine[]
}

export interface Rank {
  id: string
  name: string
  threshold: number
  description: string
}

export interface RanksView {
  ladder: Rank[]
  currentRankId: string
  points: number
  streak: { current: number; best: number; freezesLeft: number }
  bossesDefeated: number
  solvedClean: number
}

export interface AdminView {
  contentVersion: string
  importStatus: string
  importedAt: string
  rubricVersion: string
  llmMode: 'fixture' | 'live'
  spendMonthUsd: number
  spendCapUsd: number
}

export interface SystemStatus {
  judgeRunning: boolean
  reviewerAvailable: boolean
}

export interface SampleRun {
  sampleIndex: number
  status: CaseStatus
  actual: string
  timeMs: number
}

export interface SubmitResult {
  submissionId: string
  queued: boolean
}

export interface HistoryFilter {
  problemId?: string
  verdict?: Verdict
  tag?: string
}

/** The client contract. MockApi implements it now; the HTTP client implements it in Phase 9. */
export interface SenninApi {
  today(): Promise<TodayView>
  problems(): Promise<ProblemSummary[]>
  problem(id: string): Promise<ProblemDetail>
  setProblemFlags(
    id: string,
    flags: { pinned?: boolean; hidden?: boolean },
  ): Promise<ProblemSummary>
  runSamples(problemId: string, language: LanguageId, code: string): Promise<SampleRun[]>
  submit(problemId: string, language: LanguageId, code: string): Promise<SubmitResult>
  submission(id: string): Promise<Submission>
  history(filter?: HistoryFilter): Promise<SubmissionSummary[]>
  disputeTranslation(submissionId: string): Promise<Submission>
  weakness(): Promise<WeaknessProfile>
  boss(): Promise<BossWeek>
  ranks(): Promise<RanksView>
  admin(): Promise<AdminView>
  status(): Promise<SystemStatus>
}

/** Events the SignalR hub /hubs/submissions sends (docs/ARCHITECTURE.md section 4, step 8). */
export interface StreamHandlers {
  caseResolved?: (event: { submissionId: string; index: number; result: CaseResult }) => void
  graded?: (event: { submissionId: string }) => void
  reviewed?: (event: { submissionId: string }) => void
}

export interface SubmissionStream {
  subscribe(submissionId: string, handlers: StreamHandlers): () => void
}
