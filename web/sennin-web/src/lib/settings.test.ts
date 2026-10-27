import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { readSettings, updateSettings, useSettings } from './settings'

describe('settings store', () => {
  afterEach(() => {
    localStorage.clear()
    updateSettings(readSettings(true))
  })

  it('starts from defaults taken from config', () => {
    const s = readSettings(true)
    expect(s.theme).toBe('system')
    expect(s.editorFontSize).toBe(15)
    expect(s.keymap).toBe('default')
    expect(s.sound).toBe(false)
    expect(s.motion).toBe('system')
    expect(s.demo.offline).toBe(false)
  })

  it('persists and notifies', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      updateSettings({ keymap: 'vim', demo: { ...result.current.demo, judgePaused: true } })
    })
    expect(result.current.keymap).toBe('vim')
    expect(result.current.demo.judgePaused).toBe(true)
    expect(readSettings(false).keymap).toBe('vim')
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem('sennin.settings', '{not json')
    expect(readSettings(false).theme).toBe('system')
  })
})
