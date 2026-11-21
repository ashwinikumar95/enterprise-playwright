import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import type {
  AppAdapter,
  AuthConfig,
  AuthProvider,
  AuthResult,
} from '@enterprise-playwright/shared-types';
import { NormalAuthProvider } from './normalLogin.js';

export class AuthManager {
  private readonly providers = new Map<string, AuthProvider>();

  constructor(providers: AuthProvider[] = [new NormalAuthProvider()]) {
    for (const p of providers) {
      this.providers.set(p.name, p);
    }
  }

  register(provider: AuthProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(
        `Auth provider "${name}" is not registered. M1 ships normal login only.`,
      );
    }
    return provider;
  }

  async authenticate(
    page: Page,
    config: AuthConfig,
    adapter: AppAdapter,
  ): Promise<AuthResult> {
    try {
      const provider = this.getProvider(config.provider);
      await provider.login(page, config.credentials);
      await adapter.waitForAppShell(page);

      const storagePath = config.storageStatePath;
      fs.mkdirSync(path.dirname(storagePath), { recursive: true });
      await page.context().storageState({ path: storagePath });

      return { success: true, storageStatePath: storagePath };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}
