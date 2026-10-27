export type EditorMode = 'python' | 'csharp' | 'javascript' | 'plain'

export interface CodeEditorHandle {
  /** Lights lines (hover on an evidence chip); null clears. */
  highlight: (range: [number, number] | null) => void
  /** Scrolls the lines into view, lights them and moves focus to the editor. */
  reveal: (range: [number, number]) => void
  focus: () => void
}

export interface CodeEditorProps {
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
  /** Soft-wrap long lines (phones), so the editor never scrolls sideways. */
  wrap?: boolean
}
