/** Razão de contraste WCAG 2.x entre duas cores hex (#rgb ou #rrggbb). */

function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function parseHex(hex: string): [number, number, number] {
  const value = hex.trim().replace(/^#/, '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Cor hex inválida: "${hex}"`);
  }

  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Extrai os tokens `--color-*: #hex;` do bloco `@theme` de um CSS. */
export function parseThemeColorTokens(css: string): Record<string, string> {
  const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!theme) throw new Error('Bloco @theme não encontrado no CSS.');

  const tokens: Record<string, string> = {};
  for (const [, name, hex] of theme[1].matchAll(
    /(--color-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    tokens[name] = hex;
  }
  return tokens;
}

/** Remove comentários de bloco e de linha para que prosa não vire achado. */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * Encontra usos de custom property com fallback. O fallback é uma SEGUNDA fonte
 * de cor: o teste de contraste mede o token, o navegador pode pintar o
 * fallback, e os dois driftam sem ninguém ver. Comentários são ignorados.
 */
export function findVarFallbacks(source: string): string[] {
  return [...stripComments(source).matchAll(/var\(\s*--[\w-]+\s*,[^)]*\)/g)].map((m) => m[0]);
}
