import { createContext, useContext } from 'react'
import type { SenninApi, SubmissionStream } from './types'

export interface Backend {
  api: SenninApi
  stream: SubmissionStream
}

export const BackendContext = createContext<Backend | null>(null)

export function useBackend(): Backend {
  const value = useContext(BackendContext)
  if (!value) {
    throw new Error('useBackend outside BackendProvider')
  }
  return value
}
