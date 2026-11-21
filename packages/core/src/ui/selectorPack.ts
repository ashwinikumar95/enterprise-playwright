import type { LayoutMode, SelectorPack } from '@enterprise-playwright/shared-types';

export class SelectorPackRegistry {
  private readonly packs = new Map<LayoutMode, SelectorPack>();
  private defaultMode: LayoutMode = 'default';

  register(pack: SelectorPack): void {
    this.packs.set(pack.name, pack);
  }

  setDefault(mode: LayoutMode): void {
    this.defaultMode = mode;
  }

  get(mode?: LayoutMode): SelectorPack {
    const key = mode ?? this.defaultMode;
    const pack = this.packs.get(key);
    if (!pack) {
      throw new Error(
        `Selector pack "${key}" is not registered. Registered: ${[...this.packs.keys()].join(', ') || '(none)'}`,
      );
    }
    return pack;
  }

  pick(key: string, mode?: LayoutMode): string {
    const pack = this.get(mode);
    const value = pack.selectors[key];
    if (!value) {
      throw new Error(`Selector "${key}" missing from pack "${pack.name}"`);
    }
    return value;
  }

  list(): LayoutMode[] {
    return [...this.packs.keys()];
  }
}
