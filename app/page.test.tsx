import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('renderiza o título do template', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('template web');
  });

  it('expõe o link da documentação', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /documentação/i })).toHaveAttribute(
      'href',
      'https://nextjs.org/docs',
    );
  });
});
