import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AuthManager } from '../src/auth/authManager.js';
import { NormalAuthProvider } from '../src/auth/normalLogin.js';

describe('AuthManager', () => {
  it('registers normal provider by default', () => {
    const manager = new AuthManager();
    expect(manager.getProvider('normal')).toBeInstanceOf(NormalAuthProvider);
  });

  it('throws for unregistered providers without stubs', () => {
    const manager = new AuthManager([new NormalAuthProvider()]);
    expect(() => manager.getProvider('cognito')).toThrow(/not registered/);
  });
});

describe('NormalAuthProvider', () => {
  it('does not hardcode application post-login routes', () => {
    const sourcePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../src/auth/normalLogin.ts',
    );
    const source = fs.readFileSync(sourcePath, 'utf8');
    expect(source).not.toMatch(/waitForURL/);
    expect(source).not.toMatch(/\/items/);
    expect(source).toContain('fillSecretInput');
  });
});
