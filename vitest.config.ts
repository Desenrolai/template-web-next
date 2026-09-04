import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { maxTestWorkers } from './tooling/cgroup-cpus.ts';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['{app,tooling}/**/*.test.{ts,tsx}'],
    pool: 'threads',
    // Sem isto o pool dimensiona por os.cpus() — as CPUs do HOST, não as do
    // cgroup — e estoura o limite do container. Ver tooling/cgroup-cpus.ts.
    // No Vitest 4 o controle é `maxWorkers` no topo; `poolOptions.threads.
    // maxThreads` saiu da API.
    maxWorkers: maxTestWorkers(),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**/*.{ts,tsx}', 'tooling/**/*.ts'],
      exclude: ['app/**/layout.tsx', '**/*.test.*'],
    },
  },
});
