import type { AppConfig, EnvironmentDefinition } from '@enterprise-playwright/shared-types';
import { ConfigValidationError } from './validateAppConfig.js';

export interface ResolveEnvironmentInput {
  /** Explicit ENV / APP_ENV value if set. */
  explicitEnv?: string | null;
  baseURL?: string | null;
  dataPath?: string | null;
}

/**
 * Resolution order:
 * 1. Explicit ENV / APP_ENV — fail loud if unknown
 * 2. BASE_URL host markers (app-defined)
 * 3. DATA_PATH / dataDir mapping
 * 4. defaultEnvironment
 */
export function resolveEnvironment(
  config: AppConfig,
  input: ResolveEnvironmentInput = {},
): EnvironmentDefinition {
  const explicit =
    input.explicitEnv?.trim() ||
    process.env.ENV?.trim() ||
    process.env.APP_ENV?.trim() ||
    '';

  if (explicit) {
    const found = config.environments.find((e) => e.id === explicit);
    if (!found) {
      throw new ConfigValidationError(
        `Unknown environment "${explicit}". Known: ${config.environments.map((e) => e.id).join(', ')}`,
      );
    }
    return found;
  }

  const baseURL = input.baseURL ?? process.env.BASE_URL ?? config.baseURL;
  if (baseURL) {
    const lower = baseURL.toLowerCase();
    for (const env of config.environments) {
      if (env.hostMarkers.some((m) => m && lower.includes(m.toLowerCase()))) {
        return env;
      }
    }
  }

  const dataPath = input.dataPath ?? process.env.DATA_PATH ?? '';
  if (dataPath) {
    const normalized = dataPath.replace(/\\/g, '/').toLowerCase();
    for (const env of config.environments) {
      const dir = env.dataDir.replace(/\\/g, '/').toLowerCase();
      if (normalized.includes(dir) || normalized.endsWith(`/${env.id}`)) {
        return env;
      }
    }
  }

  const fallback = config.environments.find((e) => e.id === config.defaultEnvironment);
  if (!fallback) {
    throw new ConfigValidationError(
      `defaultEnvironment "${config.defaultEnvironment}" not found`,
    );
  }
  return fallback;
}

export function getActiveEnvironmentId(config: AppConfig): string {
  return resolveEnvironment(config).id;
}
