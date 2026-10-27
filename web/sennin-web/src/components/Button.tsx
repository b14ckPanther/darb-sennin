import { motion, useReducedMotion } from 'motion/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { pressScale, spring } from '../design/motion'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'quiet'

interface ButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  variant?: Variant
  icon?: IconName
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-ink hover:bg-primary/90',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-sunk',
  quiet: 'text-ink-muted hover:bg-surface-sunk hover:text-ink',
}

/** Pressable with a spring scale on press; the press is skipped under reduced motion. */
export function Button({
  variant = 'primary',
  icon,
  type = 'button',
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type={type}
      data-variant={variant}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: pressScale }}
      transition={spring.ui}
      className={cx(
        'inline-flex min-h-touch select-none items-center justify-center gap-2 rounded-control px-4',
        'text-callout font-medium transition-colors duration-(--duration-micro)',
        'disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
    </motion.button>
  )
}
