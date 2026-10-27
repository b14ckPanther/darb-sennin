import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results', 'scripts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // One icon set (ADR-042): every icon goes through src/components/Icon.tsx.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'lucide-react',
                'lucide*',
                'react-icons',
                'react-icons/*',
                '@heroicons/*',
                '@phosphor-icons/*',
                '@tabler/*',
                '@radix-ui/react-icons',
                'hugeicons-react',
                '@fortawesome/*',
                '@mui/icons-material',
                '@mui/icons-material/*',
                '@iconify/*',
                '@iconify-json/*',
              ],
              message:
                'Use <Icon> from src/components/Icon.tsx; it is the only icon source (ADR-042).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
])
