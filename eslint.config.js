import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'visizork-master/**', 'public/**', 'src/RetroMac128KPortfolio.before-rewrite.tsx']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Keep the signal but avoid blocking builds on pragmatic patterns
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      // Allow intentionally empty blocks (with comments) and quiet common patterns
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // VisiZork engine uses regexes with control chars when cleaning output
      'no-control-regex': 'off',
      // Tailwind-style escaped selectors inside template CSS
      'no-useless-escape': 'off',
    }
  },
  // Global linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  },
  // File-specific overrides where we intentionally break rules for practical reasons
  {
    files: ['src/RetroMac128KPortfolio.tsx'],
    rules: {
      // Custom hooks are invoked in a mapped list of windows; this is stable for our use-case
      'react-hooks/rules-of-hooks': 'off',
    }
  }
])
