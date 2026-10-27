import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBackend } from './backend'
import type { HistoryFilter, LanguageId } from './types'

/** One hook per read. Screens never call the API directly, so Phase 9 swaps only the client. */
export function useToday() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['today'], queryFn: () => api.today() })
}

export function useProblems() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['problems'], queryFn: () => api.problems() })
}

export function useProblem(id: string) {
  const { api } = useBackend()
  return useQuery({ queryKey: ['problem', id], queryFn: () => api.problem(id) })
}

export function useSubmission(id: string | null) {
  const { api } = useBackend()
  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => api.submission(id ?? ''),
    enabled: id !== null,
  })
}

export function useHistory(filter: HistoryFilter = {}) {
  const { api } = useBackend()
  return useQuery({ queryKey: ['history', filter], queryFn: () => api.history(filter) })
}

export function useWeakness() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['weakness'], queryFn: () => api.weakness() })
}

export function useBoss() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['boss'], queryFn: () => api.boss() })
}

export function useRanks() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['ranks'], queryFn: () => api.ranks() })
}

export function useAdmin() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['admin'], queryFn: () => api.admin() })
}

export function useStatus() {
  const { api } = useBackend()
  return useQuery({ queryKey: ['status'], queryFn: () => api.status() })
}

export function useProblemFlags() {
  const { api } = useBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; pinned?: boolean; hidden?: boolean }) =>
      api.setProblemFlags(v.id, { pinned: v.pinned, hidden: v.hidden }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['problems'] }),
  })
}

export function useRunSamples() {
  const { api } = useBackend()
  return useMutation({
    mutationFn: (v: { problemId: string; language: LanguageId; code: string }) =>
      api.runSamples(v.problemId, v.language, v.code),
  })
}

export function useSubmit() {
  const { api } = useBackend()
  return useMutation({
    mutationFn: (v: { problemId: string; language: LanguageId; code: string }) =>
      api.submit(v.problemId, v.language, v.code),
  })
}

export function useDisputeTranslation() {
  const { api } = useBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (submissionId: string) => api.disputeTranslation(submissionId),
    onSuccess: (sub) => {
      client.setQueryData(['submission', sub.id], sub)
    },
  })
}
