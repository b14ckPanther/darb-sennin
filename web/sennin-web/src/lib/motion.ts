import { useReducedMotion } from 'motion/react'
import { useSettings } from './settings'

/** Reduced motion from the system, overridden by the user's choice in Settings. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion()
  const { motion } = useSettings()
  return motion === 'reduce' || (motion === 'system' && Boolean(system))
}
