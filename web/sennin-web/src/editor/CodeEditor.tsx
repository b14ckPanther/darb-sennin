import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import {
  bracketMatching,
  HighlightStyle,
  indentOnInput,
  StreamLanguage,
  syntaxHighlighting,
} from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import {
  Compartment,
  EditorState,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  type DecorationSet,
} from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { vim } from '@replit/codemirror-vim'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export type EditorMode = 'python' | 'csharp' | 'javascript' | 'plain'

export interface CodeEditorHandle {
  /** Lights lines (hover on an evidence chip); null clears. */
  highlight: (range: [number, number] | null) => void
  /** Scrolls the lines into view, lights them and moves focus to the editor. */
  reveal: (range: [number, number]) => void
  focus: () => void
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  mode: EditorMode
  fontSize: number
  vimMode: boolean
  label: string
  /** Lines the reviewer tied to the first failure: a bracket in the margin. */
  bracket: [number, number] | null
  onSubmit: () => void
  onRunSamples: () => void
}

// Colours come from the design tokens, so both themes and the contrast tests cover the editor.
const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-content': { caretColor: 'var(--color-ink)', paddingBlock: '12px' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink-muted)',
    border: 'none',
    paddingLeft: '4px',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in oklab, var(--color-surface-sunk) 70%, transparent)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--color-ink)' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--color-ink)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--color-highlight) !important',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--color-highlight)',
    outline: '1px solid var(--color-line-strong)',
  },
  '.cm-lit': { backgroundColor: 'var(--color-highlight)' },
  '.cm-bracket': { boxShadow: 'inset 2px 0 0 var(--color-fail-mark)' },
  '.cm-fat-cursor': { background: 'var(--color-ink)', color: 'var(--color-surface)' },
  '.cm-panels': { backgroundColor: 'var(--color-surface-sunk)', color: 'var(--color-ink)' },
})

// Restrained: weight and a few muted inks, no rainbow. Gold stays reserved for praise.
const highlight = HighlightStyle.define([
  {
    tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword],
    color: 'var(--color-primary)',
    fontWeight: '600',
  },
  { tag: [t.string, t.special(t.string)], color: 'var(--color-pass-ink)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--color-limit-ink)' },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: 'var(--color-ink-muted)',
    fontStyle: 'italic',
  },
  { tag: [t.function(t.definition(t.variableName)), t.definition(t.className)], fontWeight: '600' },
  { tag: t.operator, color: 'var(--color-ink-muted)' },
])

const setLit = StateEffect.define<[number, number] | null>()
const setBracket = StateEffect.define<[number, number] | null>()

function lineDecorations(
  state: EditorState,
  range: [number, number] | null,
  cls: string,
): DecorationSet {
  if (!range) return Decoration.none
  const builder = new RangeSetBuilder<Decoration>()
  const last = state.doc.lines
  for (let n = Math.max(1, range[0]); n <= Math.min(last, range[1]); n++) {
    const line = state.doc.line(n)
    builder.add(line.from, line.from, Decoration.line({ class: cls }))
  }
  return builder.finish()
}

function rangeField(effect: typeof setLit, cls: string) {
  return StateField.define<{ range: [number, number] | null; deco: DecorationSet }>({
    create: () => ({ range: null, deco: Decoration.none }),
    update(value, tr) {
      let range = value.range
      for (const e of tr.effects) if (e.is(effect)) range = e.value
      if (range === value.range && !tr.docChanged) return value
      return { range, deco: lineDecorations(tr.state, range, cls) }
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.deco),
  })
}

const litField = rangeField(setLit, 'cm-lit')
const bracketField = rangeField(setBracket, 'cm-bracket')

function language(mode: EditorMode): Extension {
  switch (mode) {
    case 'python':
      return python()
    case 'javascript':
      return javascript()
    case 'csharp':
      return StreamLanguage.define(csharp)
    case 'plain':
      return []
  }
}

/**
 * CodeMirror 6. Tab indents while you edit; Escape then Tab leaves the editor (CodeMirror's
 * documented pattern), so the keyboard is never trapped.
 */
export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value, onChange, mode, fontSize, vimMode, label, bracket, onSubmit, onRunSamples },
  ref,
) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const handlers = useRef({ onChange, onSubmit, onRunSamples })
  handlers.current = { onChange, onSubmit, onRunSamples }
  const compartments = useRef({
    lang: new Compartment(),
    size: new Compartment(),
    vim: new Compartment(),
  })

  useEffect(() => {
    if (!host.current) return undefined
    const c = compartments.current
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          c.vim.of(vimMode ? vim() : []),
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          indentOnInput(),
          bracketMatching(),
          syntaxHighlighting(highlight),
          keymap.of([
            {
              key: 'Mod-Enter',
              preventDefault: true,
              run: () => (handlers.current.onSubmit(), true),
            },
            {
              key: "Mod-'",
              preventDefault: true,
              run: () => (handlers.current.onRunSamples(), true),
            },
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          c.lang.of(language(mode)),
          c.size.of(EditorView.theme({ '.cm-scroller': { fontSize: `${String(fontSize)}px` } })),
          theme,
          litField,
          bracketField,
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // The view is created once; later prop changes go through compartments below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.current.lang.reconfigure(language(mode)) })
  }, [mode])

  useEffect(() => {
    view.current?.dispatch({
      effects: compartments.current.size.reconfigure(
        EditorView.theme({ '.cm-scroller': { fontSize: `${String(fontSize)}px` } }),
      ),
    })
  }, [fontSize])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.current.vim.reconfigure(vimMode ? vim() : []) })
  }, [vimMode])

  useEffect(() => {
    view.current?.dispatch({ effects: setBracket.of(bracket) })
  }, [bracket])

  useImperativeHandle(ref, () => ({
    highlight: (range) => {
      view.current?.dispatch({ effects: setLit.of(range) })
    },
    reveal: (range) => {
      const v = view.current
      if (!v) return
      const line = v.state.doc.line(Math.min(Math.max(1, range[0]), v.state.doc.lines))
      v.dispatch({
        effects: [setLit.of(range), EditorView.scrollIntoView(line.from, { y: 'center' })],
        selection: { anchor: line.from },
      })
      v.focus()
    },
    focus: () => view.current?.focus(),
  }))

  return <div ref={host} className="h-full min-h-0" data-editor />
})
