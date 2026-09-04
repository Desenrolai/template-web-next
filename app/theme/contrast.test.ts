import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastRatio, findVarFallbacks, parseThemeColorTokens } from './contrast';
import { AA_NORMAL_TEXT, BRAND_ONLY_TOKENS, SURFACE_TOKENS, TEXT_PAIRS } from './pairs';

const appDir = join(import.meta.dirname, '..');

const SCANNED_EXTENSIONS = ['.css', '.ts', '.tsx'];

/** Arquivos de fonte de app/, exceto os próprios testes. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => SCANNED_EXTENSIONS.some((ext) => file.endsWith(ext)))
    .filter((file) => !file.includes('.test.'));
}
const globalsCss = readFileSync(join(appDir, 'globals.css'), 'utf8');
const tokens = parseThemeColorTokens(globalsCss);

function color(token: string): string {
  const hex = tokens[token];
  expect(hex, `token ${token} não existe em app/globals.css`).toBeDefined();
  return hex;
}

describe('contrastRatio', () => {
  it('mede os extremos conhecidos da escala WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('é simétrico', () => {
    expect(contrastRatio('#262626', '#fc624d')).toBeCloseTo(
      contrastRatio('#fc624d', '#262626'),
      10,
    );
  });
});

describe('tokens do tema', () => {
  it('declara todo token citado pelos pares', () => {
    const cited = [
      ...TEXT_PAIRS.flatMap((p) => [p.foreground, p.background]),
      ...BRAND_ONLY_TOKENS,
      ...SURFACE_TOKENS,
    ];
    for (const token of new Set(cited)) {
      expect(tokens[token], `token ${token} sumiu de app/globals.css`).toBeDefined();
    }
  });
});

describe('contraste por par de token', () => {
  it.each(TEXT_PAIRS)('$label passa em AA', ({ label, foreground, background }) => {
    const ratio = contrastRatio(color(foreground), color(background));
    expect(ratio, `${label}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('nenhum par de texto usa um token de marca como foreground', () => {
    const foregrounds = TEXT_PAIRS.map((p) => p.foreground);
    for (const brand of BRAND_ONLY_TOKENS) {
      expect(foregrounds, `${brand} é marca, não pode carregar texto`).not.toContain(brand);
    }
  });

  // Caso de controle: se a marca passasse em AA, a separação marca/ação seria
  // cerimônia sem motivo. Este teste prova que o motivo existe e continua real.
  it.each(BRAND_ONLY_TOKENS)('%s reprova em AA sobre TODA superfície', (brand) => {
    for (const surface of SURFACE_TOKENS) {
      const ratio = contrastRatio(color(brand), color(surface));
      expect(ratio, `${brand} sobre ${surface} = ${ratio.toFixed(2)}:1`).toBeLessThan(
        AA_NORMAL_TEXT,
      );
    }
  });
});

describe('guarda de fallback de cor', () => {
  // Um fallback `var(--x, #hex)` é uma SEGUNDA fonte de cor: o teste acima mede
  // o token, o navegador pode pintar o fallback, e os dois driftam em silêncio.
  it('detecta fallback num trecho de controle e ignora token sem fallback', () => {
    expect(findVarFallbacks('color: var(--color-brand, #f0503c);')).toHaveLength(1);
    expect(findVarFallbacks('color: var(--color-brand);')).toHaveLength(0);
  });

  it('não confunde prosa em comentário com uso real', () => {
    expect(findVarFallbacks('/* nunca use var(--x, #hex) aqui */')).toEqual([]);
    expect(findVarFallbacks('// nunca use var(--x, #hex)')).toEqual([]);
    expect(findVarFallbacks('/* proibido */ color: var(--x, #hex);')).toHaveLength(1);
  });

  it('nenhum arquivo de app/ usa fallback de cor', () => {
    const offenders = sourceFiles(appDir)
      .map((file) => ({ file, hits: findVarFallbacks(readFileSync(file, 'utf8')) }))
      .filter(({ hits }) => hits.length > 0);

    expect(offenders).toEqual([]);
  });
});
