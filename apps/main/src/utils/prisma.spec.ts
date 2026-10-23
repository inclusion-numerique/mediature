/**
 * @jest-environment node
 */
import { formatSearchQuery } from '@mediature/main/src/utils/prisma';

describe('formatSearchQuery()', () => {
  it('should escape spaces', () => {
    expect(formatSearchQuery('jean  pierre\tdupont\n')).toBe('jean__pierre_dupont_');
  });

  it('should escape full-text search operators', () => {
    expect(formatSearchQuery('"é_&')).toBe('"é__');
    expect(formatSearchQuery('martin!')).toBe('martin_');
    expect(formatSearchQuery('dupont (fils)')).toBe('dupont__fils_');
    expect(formatSearchQuery('x|y<->z')).toBe('x_y_-_z');
    expect(formatSearchQuery('foo:*')).toBe('foo__');
    expect(formatSearchQuery("d'artagnan\\")).toBe('d_artagnan_');
  });

  it('should keep other characters', () => {
    expect(formatSearchQuery('jean-pierre')).toBe('jean-pierre');
    expect(formatSearchQuery('a.b@c.fr')).toBe('a.b@c.fr');
    expect(formatSearchQuery('éèç 4318')).toBe('éèç_4318');
  });
});
