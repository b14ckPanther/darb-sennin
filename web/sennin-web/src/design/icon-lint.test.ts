import { ESLint } from 'eslint'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Proves the lint rule that keeps the app on one icon set (ADR-042).
describe('icon import rule', () => {
  const eslint = new ESLint({ cwd: resolve(import.meta.dirname, '../..') })
  const lint = async (code: string) => {
    const [result] = await eslint.lintText(code, {
      // An existing file, so the type-aware parser accepts it; its text is replaced by `code`.
      filePath: resolve(import.meta.dirname, '../components/Icon.tsx'),
    })
    return (result?.messages ?? []).filter((m) => m.ruleId === 'no-restricted-imports')
  }

  it.each([
    "import { Check } from 'lucide-react'",
    "import { FaCheck } from 'react-icons/fa'",
    "import { CheckIcon } from '@heroicons/react/24/solid'",
    "import { Icon } from '@iconify/react'",
  ])(
    'rejects %s',
    async (line) => {
      expect(await lint(`${line}\nexport const x = 1\n`)).toHaveLength(1)
    },
    30_000,
  )

  it('allows the Icon component', async () => {
    expect(await lint("import { Icon } from './Icon'\nexport const x = Icon\n")).toHaveLength(0)
  }, 30_000)
})
