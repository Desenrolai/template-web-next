import next from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['.next/**', 'coverage/**', 'next-env.d.ts', 'node_modules/**'],
  },
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Convenção do projeto: zero `any`.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];

export default config;
