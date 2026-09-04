/**
 * Pares (texto, fundo) que a UI realmente usa. O teste em contrast.test.ts
 * resolve cada nome contra os tokens de app/globals.css e prova AA por PAR —
 * renomear ou remover um token quebra o teste, e não só o visual.
 */
export interface TextPair {
  readonly label: string;
  readonly foreground: string;
  readonly background: string;
}

/** Mínimo WCAG 2.2 AA para texto normal. */
export const AA_NORMAL_TEXT = 4.5;

export const TEXT_PAIRS: readonly TextPair[] = [
  { label: 'texto sobre papel', foreground: '--color-ink-on-paper', background: '--color-paper' },
  {
    label: 'texto sobre carvão',
    foreground: '--color-ink-on-carbon',
    background: '--color-carbon',
  },
  { label: 'ação sobre papel', foreground: '--color-action-on-paper', background: '--color-paper' },
  {
    label: 'ação sobre carvão',
    foreground: '--color-action-on-carbon',
    background: '--color-carbon',
  },
  {
    label: 'ação hover sobre carvão',
    foreground: '--color-action-on-carbon-hover',
    background: '--color-carbon',
  },
];

/**
 * Tokens de MARCA: identidade visual apenas. Nenhum par de texto pode usá-los
 * como foreground — nenhum deles passa em AA sobre as superfícies do tema.
 */
export const BRAND_ONLY_TOKENS: readonly string[] = ['--color-brand'];

/** Superfícies contra as quais a marca é medida no caso de controle. */
export const SURFACE_TOKENS: readonly string[] = ['--color-paper', '--color-carbon'];
