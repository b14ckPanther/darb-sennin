import { motion, useReducedMotion } from 'motion/react'
import { pressScale, spring } from '../design/motion'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export interface TabItem {
  id: string
  label: string
  icon: IconName
}

interface TabBarProps {
  label: string
  items: TabItem[]
  activeId: string
  onSelect: (id: string) => void
}

/** Phone tab bar: translucent material, safe-area aware, filled glyph on the current tab. */
export function TabBar({ label, items, activeId, onSelect }: TabBarProps) {
  const reduce = useReducedMotion()
  return (
    <nav
      aria-label={label}
      className="material-bar border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id} className="flex-1">
              <motion.button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  onSelect(item.id)
                }}
                whileTap={reduce ? undefined : { scale: pressScale }}
                transition={spring.ui}
                className={cx(
                  'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 pt-1.5 text-caption font-medium',
                  active ? 'text-tab-active' : 'text-ink-muted',
                )}
              >
                <Icon name={item.icon} filled={active} size={24} />
                <span>{item.label}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
