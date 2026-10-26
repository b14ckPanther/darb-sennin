import solar from '../design/icons/solar.generated.json'

export type IconName = keyof typeof solar.icons

interface IconProps {
  name: IconName
  /** Accessible name. Omit for decorative icons that sit next to a visible label. */
  label?: string
  /** Bold duotone glyph, used for selected states such as the active tab. */
  filled?: boolean
  size?: number
  className?: string
}

/** The only way to draw an icon in Darb Sennin (ADR-042). Glyphs come from the Solar set. */
export function Icon({ name, label, filled = false, size = 20, className }: IconProps) {
  const glyph = solar.icons[name]
  const body = filled ? glyph['bold-duotone'] : glyph.linear
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${String(solar.width)} ${String(solar.height)}`}
      width={size}
      height={size}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      // Bodies come from the bundled, generated Solar subset, never from user input.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
