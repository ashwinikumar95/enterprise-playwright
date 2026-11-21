import { describe, expect, it } from 'vitest';
import { SelectorPackRegistry } from '../src/ui/selectorPack.js';

describe('SelectorPackRegistry', () => {
  it('registers and picks selectors', () => {
    const registry = new SelectorPackRegistry();
    registry.register({
      name: 'default',
      selectors: { sidebarItems: '[data-testid="nav-items"]' },
    });
    registry.setDefault('default');
    expect(registry.pick('sidebarItems')).toBe('[data-testid="nav-items"]');
  });

  it('throws for missing pack', () => {
    const registry = new SelectorPackRegistry();
    expect(() => registry.get('default')).toThrow(/not registered/);
  });
});
