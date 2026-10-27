import type { ReactNode } from 'react'

// Statements use a small Markdown subset: paragraphs, ordered lists, **bold** and `code`.
// Rendered as React elements, never as HTML, so content can never inject markup.
// KaTeX arrives with the real content model (Phase 4) if a statement needs it.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded-[4px] bg-surface-sunk px-1 py-px text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n{2,}/)
  return (
    <div className="space-y-3 text-body text-ink">
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-6 marker:text-ink-muted">
              {lines.map((l) => (
                <li key={l}>{inline(l.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          )
        }
        return <p key={i}>{inline(lines.join(' '))}</p>
      })}
    </div>
  )
}
