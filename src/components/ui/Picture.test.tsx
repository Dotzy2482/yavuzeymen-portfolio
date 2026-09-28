import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Picture } from './Picture';

describe('Picture', () => {
  it('offers AVIF then WebP beside a raster, and keeps the original as the <img>', () => {
    const { container } = render(
      <Picture src="/images/simtoreal/rig.png" alt="Sim rig" width={433} height={545} />,
    );

    const sources = [...container.querySelectorAll('source')].map((s) => [
      s.getAttribute('type'),
      s.getAttribute('srcset'),
    ]);
    expect(sources).toEqual([
      ['image/avif', '/images/simtoreal/rig.avif'],
      ['image/webp', '/images/simtoreal/rig.webp'],
    ]);

    const img = screen.getByRole('img', { name: 'Sim rig' });
    expect(img).toHaveAttribute('src', '/images/simtoreal/rig.png');
    expect(img).toHaveAttribute('width', '433');
  });

  it('derives the encodes from a .jpg too', () => {
    const { container } = render(<Picture src="/images/portraits/studio-seated.jpg" alt="" />);
    expect(container.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/portraits/studio-seated.avif',
    );
  });

  it('renders an SVG as a bare <img>, with nothing to encode', () => {
    const { container } = render(
      <Picture src="/images/partners/drivehunter.svg" alt="drivehunter" />,
    );
    expect(container.querySelector('picture')).toBeNull();
    expect(container.querySelector('source')).toBeNull();
    expect(screen.getByRole('img', { name: 'drivehunter' })).toBeInTheDocument();
  });
});
